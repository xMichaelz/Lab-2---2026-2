package com.udea.lab12026p;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.udea.lab12026p.dto.CustomerDTO;
import com.udea.lab12026p.dto.TransferRequestDTO;
import com.udea.lab12026p.repository.CustomerRepository;
import com.udea.lab12026p.repository.TransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class Lab12026pApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @BeforeEach
    void cleanDatabase() {
        transactionRepository.deleteAll();
        customerRepository.deleteAll();
    }

    @Test
    void contextLoads() {
    }

    @Test
    void createCustomer_success() throws Exception {
        CustomerDTO customer = new CustomerDTO(null, "Ana", "Perez", "111111", 1000.0);

        mockMvc.perform(post("/api/customers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(customer)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.firstName").value("Ana"))
                .andExpect(jsonPath("$.lastName").value("Perez"))
                .andExpect(jsonPath("$.accountNumber").value("111111"))
                .andExpect(jsonPath("$.balance").value(1000.0));
    }

    @Test
    void getAllCustomers_success() throws Exception {
        createCustomerViaApi("Ana", "Perez", "111111", 1000.0);
        createCustomerViaApi("Luis", "Gomez", "222222", 200.0);

        mockMvc.perform(get("/api/customers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)));
    }

    @Test
    void getCustomerById_success() throws Exception {
        Long id = createCustomerViaApi("Ana", "Perez", "111111", 1000.0);

        mockMvc.perform(get("/api/customers/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accountNumber").value("111111"))
                .andExpect(jsonPath("$.firstName").value("Ana"));
    }

    @Test
    void createCustomer_duplicateAccount_returnsConflict() throws Exception {
        createCustomerViaApi("Ana", "Perez", "111111", 1000.0);
        CustomerDTO duplicate = new CustomerDTO(null, "Luis", "Gomez", "111111", 200.0);

        mockMvc.perform(post("/api/customers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(duplicate)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("El número de cuenta ya existe."))
                .andExpect(jsonPath("$.status").value(409));
    }

    @Test
    void transferMoney_success() throws Exception {
        createCustomerViaApi("Ana", "Perez", "111111", 1000.0);
        createCustomerViaApi("Luis", "Gomez", "222222", 200.0);

        TransferRequestDTO request = new TransferRequestDTO("111111", "222222", 150.0);

        mockMvc.perform(post("/api/transactions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.senderAccountNumber").value("111111"))
                .andExpect(jsonPath("$.receiverAccountNumber").value("222222"))
                .andExpect(jsonPath("$.amount").value(150.0))
                .andExpect(jsonPath("$.timestamp").exists());

        mockMvc.perform(get("/api/customers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.accountNumber=='111111')].balance", contains(850.0)))
                .andExpect(jsonPath("$[?(@.accountNumber=='222222')].balance", contains(350.0)));
    }

    @Test
    void transferMoney_insufficientBalance() throws Exception {
        createCustomerViaApi("Ana", "Perez", "111111", 100.0);
        createCustomerViaApi("Luis", "Gomez", "222222", 200.0);

        TransferRequestDTO request = new TransferRequestDTO("111111", "222222", 150.0);

        mockMvc.perform(post("/api/transactions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Saldo insuficiente."))
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    void transferMoney_nonexistentAccount() throws Exception {
        createCustomerViaApi("Ana", "Perez", "111111", 1000.0);

        TransferRequestDTO request = new TransferRequestDTO("111111", "999999", 150.0);

        mockMvc.perform(post("/api/transactions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("La cuenta destino no existe."))
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    void transferMoney_sameAccount() throws Exception {
        createCustomerViaApi("Ana", "Perez", "111111", 1000.0);

        TransferRequestDTO request = new TransferRequestDTO("111111", "111111", 150.0);

        mockMvc.perform(post("/api/transactions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("La cuenta origen y destino deben ser diferentes."))
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    void getTransactionHistory_success() throws Exception {
        createCustomerViaApi("Ana", "Perez", "111111", 1000.0);
        createCustomerViaApi("Luis", "Gomez", "222222", 200.0);

        TransferRequestDTO request = new TransferRequestDTO("111111", "222222", 150.0);
        mockMvc.perform(post("/api/transactions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/transactions/account/{accountNumber}", "111111"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].senderAccountNumber").value("111111"))
                .andExpect(jsonPath("$[0].receiverAccountNumber").value("222222"))
                .andExpect(jsonPath("$[0].amount").value(150.0));

        mockMvc.perform(get("/api/transactions/account/{accountNumber}", "222222"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));
    }

    private Long createCustomerViaApi(String firstName, String lastName, String accountNumber, Double balance) throws Exception {
        CustomerDTO customer = new CustomerDTO(null, firstName, lastName, accountNumber, balance);
        MvcResult result = mockMvc.perform(post("/api/customers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(customer)))
                .andExpect(status().isCreated())
                .andReturn();

        CustomerDTO created = objectMapper.readValue(result.getResponse().getContentAsString(), CustomerDTO.class);
        return created.getId();
    }
}
