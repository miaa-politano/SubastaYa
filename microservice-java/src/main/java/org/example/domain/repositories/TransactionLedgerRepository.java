package org.example.domain.repositories;

import org.example.domain.entities.TransactionLedger;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TransactionLedgerRepository extends JpaRepository<TransactionLedger, Integer> {
}