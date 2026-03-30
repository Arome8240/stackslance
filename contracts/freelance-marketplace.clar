;; ============================================================
;; Freelance Marketplace - Clarity Smart Contract
;; Stacks blockchain | Full escrow + state machine design
;; ============================================================

;; -----------------------------------------------
;; Constants
;; -----------------------------------------------
(define-constant ARBITRATOR 'SP30B2R72X2HNZB589SNDX2XKKNMWZ8EEHR6Q68H6) ;; replace with real arbitrator address

(define-constant ERR-NOT-FOUND          (err u100))
(define-constant ERR-UNAUTHORIZED       (err u101))
(define-constant ERR-INVALID-STATE      (err u102))
(define-constant ERR-ALREADY-APPLIED    (err u103))
(define-constant ERR-INVALID-AMOUNT     (err u105))
(define-constant ERR-SELF-ASSIGN        (err u106))
(define-constant ERR-NOT-APPLICANT      (err u107))

;; -----------------------------------------------
;; Job Status (state machine)
;; OPEN -> ASSIGNED -> SUBMITTED -> COMPLETED
;;                  -> DISPUTED  -> RESOLVED
;; -----------------------------------------------
(define-constant STATUS-OPEN       u0)
(define-constant STATUS-ASSIGNED   u1)
(define-constant STATUS-SUBMITTED  u2)
(define-constant STATUS-COMPLETED  u3)
(define-constant STATUS-DISPUTED   u4)
(define-constant STATUS-RESOLVED   u5)

;; -----------------------------------------------
;; Data Vars
;; -----------------------------------------------
(define-data-var job-counter uint u0)

;; -----------------------------------------------
;; Data Maps
;; -----------------------------------------------

;; Core job data
(define-map jobs
  { job-id: uint }
  {
    client:           principal,
    freelancer:       (optional principal),
    amount:           uint,
    status:           uint,
    description-hash: (string-ascii 64),
    submission-hash:  (optional (string-ascii 64)),
    created-at:       uint
  }
)

;; Freelancer applications: (job-id, applicant) -> proposal IPFS hash
(define-map applications
  { job-id: uint, applicant: principal }
  { proposal-hash: (string-ascii 64) }
)

;; Track applicant count per job
(define-map job-applicant-count
  { job-id: uint }
  { count: uint }
)

;; -----------------------------------------------
;; Private Helpers
;; -----------------------------------------------

(define-private (get-job-or-err (job-id uint))
  (match (map-get? jobs { job-id: job-id })
    job (ok job)
    ERR-NOT-FOUND
  )
)

(define-private (assert-status (job-id uint) (expected-status uint))
  (let ((job (try! (get-job-or-err job-id))))
    (if (is-eq (get status job) expected-status)
        (ok job)
        ERR-INVALID-STATE)
  )
)

(define-private (assert-client (job { client: principal, freelancer: (optional principal), amount: uint, status: uint, description-hash: (string-ascii 64), submission-hash: (optional (string-ascii 64)), created-at: uint }) (caller principal))
  (if (is-eq (get client job) caller)
      (ok true)
      ERR-UNAUTHORIZED)
)

(define-private (assert-freelancer (job { client: principal, freelancer: (optional principal), amount: uint, status: uint, description-hash: (string-ascii 64), submission-hash: (optional (string-ascii 64)), created-at: uint }) (caller principal))
  (match (get freelancer job)
    fl (if (is-eq fl caller) (ok true) ERR-UNAUTHORIZED)
    ERR-UNAUTHORIZED
  )
)

;; -----------------------------------------------
;; Public Functions
;; -----------------------------------------------

;; 1. Create a job - client locks STX in escrow
(define-public (create-job (description-hash (string-ascii 64)) (amount uint))
  (begin
    (asserts! (> amount u0) ERR-INVALID-AMOUNT)
    (asserts! (> (len description-hash) u0) ERR-INVALID-AMOUNT)

    ;; Transfer STX from client to contract (escrow)
    (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))

    (let ((new-id (+ (var-get job-counter) u1)))
      (var-set job-counter new-id)
      (map-set jobs
        { job-id: new-id }
        {
          client:           tx-sender,
          freelancer:       none,
          amount:           amount,
          status:           STATUS-OPEN,
          description-hash: description-hash,
          submission-hash:  none,
          created-at:       block-height
        }
      )
      (map-set job-applicant-count { job-id: new-id } { count: u0 })
      (ok new-id)
    )
  )
)

;; 2. Apply to a job - freelancer submits proposal hash
(define-public (apply-to-job (job-id uint) (proposal-hash (string-ascii 64)))
  (let ((job (try! (assert-status job-id STATUS-OPEN))))
    (asserts! (not (is-eq (get client job) tx-sender)) ERR-SELF-ASSIGN)
    (asserts! (is-none (map-get? applications { job-id: job-id, applicant: tx-sender })) ERR-ALREADY-APPLIED)
    (asserts! (> (len proposal-hash) u0) ERR-INVALID-AMOUNT)

    (map-set applications
      { job-id: job-id, applicant: tx-sender }
      { proposal-hash: proposal-hash }
    )
    (match (map-get? job-applicant-count { job-id: job-id })
      existing (map-set job-applicant-count { job-id: job-id } { count: (+ (get count existing) u1) })
      (map-set job-applicant-count { job-id: job-id } { count: u1 })
    )
    (ok true)
  )
)

;; 3. Assign a freelancer - client picks from applicants
(define-public (assign-freelancer (job-id uint) (freelancer principal))
  (let ((job (try! (assert-status job-id STATUS-OPEN))))
    (try! (assert-client job tx-sender))
    (asserts! (not (is-eq freelancer tx-sender)) ERR-SELF-ASSIGN)
    ;; Freelancer must have applied
    (asserts! (is-some (map-get? applications { job-id: job-id, applicant: freelancer })) ERR-NOT-APPLICANT)

    (map-set jobs
      { job-id: job-id }
      (merge job { freelancer: (some freelancer), status: STATUS-ASSIGNED })
    )
    (ok true)
  )
)

;; 4. Submit work - freelancer uploads to IPFS and submits hash
(define-public (submit-work (job-id uint) (submission-hash (string-ascii 64)))
  (let ((job (try! (assert-status job-id STATUS-ASSIGNED))))
    (try! (assert-freelancer job tx-sender))
    (asserts! (> (len submission-hash) u0) ERR-INVALID-AMOUNT)

    (map-set jobs
      { job-id: job-id }
      (merge job { submission-hash: (some submission-hash), status: STATUS-SUBMITTED })
    )
    (ok true)
  )
)

;; 5. Approve work - client releases escrow to freelancer
(define-public (approve-work (job-id uint))
  (let ((job (try! (assert-status job-id STATUS-SUBMITTED))))
    (try! (assert-client job tx-sender))

    (let ((freelancer (unwrap! (get freelancer job) ERR-NOT-FOUND))
          (amount (get amount job)))
      ;; Release escrow
      (try! (as-contract (stx-transfer? amount tx-sender freelancer)))
      (map-set jobs
        { job-id: job-id }
        (merge job { status: STATUS-COMPLETED })
      )
      (ok true)
    )
  )
)

;; 6. Raise a dispute - client or freelancer can dispute submitted work
(define-public (raise-dispute (job-id uint))
  (let ((job (try! (assert-status job-id STATUS-SUBMITTED))))
    (asserts!
      (or
        (is-eq (get client job) tx-sender)
        (is-eq (some tx-sender) (get freelancer job))
      )
      ERR-UNAUTHORIZED
    )
    (map-set jobs
      { job-id: job-id }
      (merge job { status: STATUS-DISPUTED })
    )
    (ok true)
  )
)

;; 7. Resolve dispute - arbitrator decides who gets the funds
;;    pay-freelancer: true = freelancer gets paid, false = client refunded
(define-public (resolve-dispute (job-id uint) (pay-freelancer bool))
  (let ((job (try! (assert-status job-id STATUS-DISPUTED))))
    (asserts! (is-eq tx-sender ARBITRATOR) ERR-UNAUTHORIZED)

    (let ((amount (get amount job))
          (client (get client job))
          (freelancer (unwrap! (get freelancer job) ERR-NOT-FOUND)))
      (if pay-freelancer
        (try! (as-contract (stx-transfer? amount tx-sender freelancer)))
        (try! (as-contract (stx-transfer? amount tx-sender client)))
      )
      (map-set jobs
        { job-id: job-id }
        (merge job { status: STATUS-RESOLVED })
      )
      (ok true)
    )
  )
)

;; -----------------------------------------------
;; Read-Only Functions (for UI queries)
;; -----------------------------------------------

(define-read-only (get-job (job-id uint))
  (map-get? jobs { job-id: job-id })
)

(define-read-only (get-application (job-id uint) (applicant principal))
  (map-get? applications { job-id: job-id, applicant: applicant })
)

(define-read-only (get-job-count)
  (var-get job-counter)
)

(define-read-only (get-applicant-count (job-id uint))
  (match (map-get? job-applicant-count { job-id: job-id })
    data (get count data)
    u0
  )
)

(define-read-only (has-applied (job-id uint) (applicant principal))
  (is-some (map-get? applications { job-id: job-id, applicant: applicant }))
)

(define-read-only (get-job-status (job-id uint))
  (match (map-get? jobs { job-id: job-id })
    job (some (get status job))
    none
  )
)

(define-read-only (is-client (job-id uint) (caller principal))
  (match (map-get? jobs { job-id: job-id })
    job (is-eq (get client job) caller)
    false
  )
)

(define-read-only (is-assigned-freelancer (job-id uint) (caller principal))
  (match (map-get? jobs { job-id: job-id })
    job (is-eq (some caller) (get freelancer job))
    false
  )
)
