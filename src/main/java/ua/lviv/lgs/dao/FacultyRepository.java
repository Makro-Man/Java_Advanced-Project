package ua.lviv.lgs.dao;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import ua.lviv.lgs.domain.Faculty;

public interface FacultyRepository extends JpaRepository<Faculty, Integer>{

    Optional<Faculty> findByTitle(String title);

}
