package com.udea.lab12026p.mapper;

import com.udea.lab12026p.dto.TransactionDTO;
import com.udea.lab12026p.entity.Transaction;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface TransactionMapper {
    TransactionDTO toDTO(Transaction transaction);
}
