package com.udea.lab12026p.service;

import com.udea.lab12026p.dto.TransactionDTO;
import com.udea.lab12026p.dto.TransferRequestDTO;
import com.udea.lab12026p.entity.Customer;
import com.udea.lab12026p.entity.Transaction;
import com.udea.lab12026p.exception.BusinessException;
import com.udea.lab12026p.mapper.TransactionMapper;
import com.udea.lab12026p.repository.CustomerRepository;
import com.udea.lab12026p.repository.TransactionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final CustomerRepository customerRepository;
    private final TransactionMapper transactionMapper;

    public TransactionService(TransactionRepository transactionRepository,
                              CustomerRepository customerRepository,
                              TransactionMapper transactionMapper) {
        this.transactionRepository = transactionRepository;
        this.customerRepository = customerRepository;
        this.transactionMapper = transactionMapper;
    }

    @Transactional
    public TransactionDTO transferMoney(TransferRequestDTO request) {
        if (request.getSenderAccountNumber() == null || request.getSenderAccountNumber().isBlank()) {
            throw new BusinessException("La cuenta origen es obligatoria.", HttpStatus.BAD_REQUEST);
        }
        if (request.getReceiverAccountNumber() == null || request.getReceiverAccountNumber().isBlank()) {
            throw new BusinessException("La cuenta destino es obligatoria.", HttpStatus.BAD_REQUEST);
        }
        if (request.getAmount() == null || request.getAmount() <= 0) {
            throw new BusinessException("El monto debe ser mayor que cero.", HttpStatus.BAD_REQUEST);
        }

        String senderAccount = request.getSenderAccountNumber().trim();
        String receiverAccount = request.getReceiverAccountNumber().trim();

        if (senderAccount.equals(receiverAccount)) {
            throw new BusinessException("La cuenta origen y destino deben ser diferentes.", HttpStatus.BAD_REQUEST);
        }

        Customer sender = customerRepository.findByAccountNumber(senderAccount)
                .orElseThrow(() -> new BusinessException("La cuenta origen no existe.", HttpStatus.NOT_FOUND));
        Customer receiver = customerRepository.findByAccountNumber(receiverAccount)
                .orElseThrow(() -> new BusinessException("La cuenta destino no existe.", HttpStatus.NOT_FOUND));

        if (sender.getBalance() < request.getAmount()) {
            throw new BusinessException("Saldo insuficiente.", HttpStatus.BAD_REQUEST);
        }

        sender.setBalance(sender.getBalance() - request.getAmount());
        receiver.setBalance(receiver.getBalance() + request.getAmount());

        customerRepository.save(sender);
        customerRepository.save(receiver);

        Transaction transaction = new Transaction();
        transaction.setSenderAccountNumber(sender.getAccountNumber());
        transaction.setReceiverAccountNumber(receiver.getAccountNumber());
        transaction.setAmount(request.getAmount());
        transaction.setTimestamp(LocalDateTime.now());

        Transaction saved = transactionRepository.save(transaction);
        return transactionMapper.toDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<TransactionDTO> getAllTransactions() {
        return transactionRepository.findAll().stream()
                .map(transactionMapper::toDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public TransactionDTO getTransactionById(Long id) {
        return transactionRepository.findById(id)
                .map(transactionMapper::toDTO)
                .orElseThrow(() -> new BusinessException("Transacción no encontrada.", HttpStatus.NOT_FOUND));
    }

    @Transactional(readOnly = true)
    public List<TransactionDTO> getTransactionsForAccount(String accountNumber) {
        if (accountNumber == null || accountNumber.isBlank()) {
            throw new BusinessException("El número de cuenta es obligatorio.", HttpStatus.BAD_REQUEST);
        }

        return transactionRepository
                .findBySenderAccountNumberOrReceiverAccountNumber(accountNumber, accountNumber)
                .stream()
                .map(transactionMapper::toDTO)
                .toList();
    }
}
