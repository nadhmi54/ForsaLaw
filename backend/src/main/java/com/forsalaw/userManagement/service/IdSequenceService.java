package com.forsalaw.userManagement.service;

import com.forsalaw.userManagement.entity.IdSequence;
import com.forsalaw.userManagement.repository.IdSequenceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class IdSequenceService {

    private final IdSequenceRepository idSequenceRepository;

    /** Génère le prochain ID au format AAAA-XXX-NNNNN (ex: 2025-USR-00001). */
    @Transactional
    public String generateNextId(String prefix) {
        int year = LocalDate.now().getYear();
        var seq = idSequenceRepository.findByEntityTypeAndYearForUpdate(prefix, year);
        long nextVal;
        if (seq.isEmpty()) {
            IdSequence newSeq = new IdSequence();
            newSeq.setEntityType(prefix);
            newSeq.setYear(year);
            newSeq.setNextVal(2);
            idSequenceRepository.save(newSeq);
            nextVal = 1;
        } else {
            IdSequence s = seq.get();
            nextVal = s.getNextVal();
            s.setNextVal(nextVal + 1);
            idSequenceRepository.save(s);
        }
        return year + "-" + prefix + "-" + String.format("%05d", nextVal);
    }
}
