package ua.lviv.lgs.dao;

import org.springframework.data.jpa.repository.JpaRepository;

import ua.lviv.lgs.domain.User;

public interface UserRepository extends JpaRepository<User, Integer>{
    User findByEmail(String email);

    User findByActivationCode(String code);

}
