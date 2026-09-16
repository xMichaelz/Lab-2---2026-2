package com.udea.lab12026p.service;

import com.udea.lab12026p.dto.CustomerDTO;
import com.udea.lab12026p.entity.Customer;
import com.udea.lab12026p.exception.BusinessException;
import com.udea.lab12026p.mapper.CustomerMapper;
import com.udea.lab12026p.repository.CustomerRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final CustomerMapper customerMapper;

    public CustomerService(CustomerRepository customerRepository, CustomerMapper customerMapper) {
        this.customerRepository = customerRepository;
        this.customerMapper = customerMapper;
    }

    @Transactional(readOnly = true)
    public List<CustomerDTO> getAllCustomers() {
        return customerRepository.findAll().stream()
                .map(customerMapper::toDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public CustomerDTO getCustomerById(Long id) {
        return customerRepository.findById(id)
                .map(customerMapper::toDTO)
                .orElseThrow(() -> new BusinessException("Cliente no encontrado.", HttpStatus.NOT_FOUND));
    }

    @Transactional
    public CustomerDTO createCustomer(CustomerDTO customerDTO) {
        validateCustomer(customerDTO);

        if (customerRepository.findByAccountNumber(customerDTO.getAccountNumber().trim()).isPresent()) {
            throw new BusinessException("El número de cuenta ya existe.", HttpStatus.CONFLICT);
        }

        Customer customer = customerMapper.toEntity(customerDTO);
        customer.setAccountNumber(customerDTO.getAccountNumber().trim());
        customer.setFirstName(customerDTO.getFirstName().trim());
        customer.setLastName(customerDTO.getLastName().trim());
        customer.setId(null);

        return customerMapper.toDTO(customerRepository.save(customer));
    }

    private void validateCustomer(CustomerDTO customerDTO) {
        if (customerDTO.getFirstName() == null || customerDTO.getFirstName().isBlank()) {
            throw new BusinessException("El nombre es obligatorio.", HttpStatus.BAD_REQUEST);
        }
        if (customerDTO.getLastName() == null || customerDTO.getLastName().isBlank()) {
            throw new BusinessException("El apellido es obligatorio.", HttpStatus.BAD_REQUEST);
        }
        if (customerDTO.getAccountNumber() == null || customerDTO.getAccountNumber().isBlank()) {
            throw new BusinessException("El número de cuenta es obligatorio.", HttpStatus.BAD_REQUEST);
        }
        if (customerDTO.getBalance() == null) {
            throw new BusinessException("El saldo es obligatorio.", HttpStatus.BAD_REQUEST);
        }
        if (customerDTO.getBalance() < 0) {
            throw new BusinessException("El saldo debe ser mayor o igual a cero.", HttpStatus.BAD_REQUEST);
        }
    }
}
