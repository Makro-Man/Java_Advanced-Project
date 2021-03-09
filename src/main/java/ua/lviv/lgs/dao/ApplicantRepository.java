package ua.lviv.lgs.dao;

import org.springframework.data.jpa.repository.JpaRepository;

import ua.lviv.lgs.domain.Applicant;

public interface ApplicantRepository extends JpaRepository<Applicant, Integer>{

}
