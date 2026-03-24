package com.forsalaw.userManagement.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;

/**
 * Séquence pour génération d'IDs au format AAAA-XXX-NNNNN (année-type-numéro).
 */
@Entity
@Table(name = "id_sequences")
@Getter
@Setter
@IdClass(IdSequence.IdSequencePK.class)
public class IdSequence {

    @Id
    @Column(name = "entity_type", length = 10)
    private String entityType;

    @Id
    @Column(name = "year")
    private int year;

    @Column(name = "next_val", nullable = false)
    private long nextVal = 1;

    @SuppressWarnings("serial")
    public static class IdSequencePK implements Serializable {
        private String entityType;
        private int year;

        public String getEntityType() { return entityType; }
        public void setEntityType(String entityType) { this.entityType = entityType; }
        public int getYear() { return year; }
        public void setYear(int year) { this.year = year; }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            IdSequencePK that = (IdSequencePK) o;
            return year == that.year && java.util.Objects.equals(entityType, that.entityType);
        }

        @Override
        public int hashCode() {
            return java.util.Objects.hash(entityType, year);
        }
    }
}
