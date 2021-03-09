package ua.lviv.lgs.dao;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import ua.lviv.lgs.domain.Speciality;

public interface SpecialityRepository extends JpaRepository<Speciality, Integer>{

    List<Speciality> findByRecruitmentCompletedFalse();

    Optional<Speciality> findByTitle(String title);
}
