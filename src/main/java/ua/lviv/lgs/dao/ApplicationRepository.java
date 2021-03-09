package ua.lviv.lgs.dao;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import ua.lviv.lgs.domain.Applicant;
import ua.lviv.lgs.domain.Application;
import ua.lviv.lgs.domain.Speciality;

public interface ApplicationRepository extends JpaRepository<Application, Integer>{

    List<Application> findByApplicant(Applicant applicant);

    Optional<Application> findByApplicantAndSpeciality(Applicant applicant, Speciality speciality);
}
