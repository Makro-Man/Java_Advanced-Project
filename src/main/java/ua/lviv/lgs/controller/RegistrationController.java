package ua.lviv.lgs.controller;

import java.util.Collections;
import java.util.Map;

import javax.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.util.StringUtils;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import ua.lviv.lgs.domain.User;
import ua.lviv.lgs.dto.CaptchaResponse;
import ua.lviv.lgs.service.UserService;

@Controller
public class RegistrationController {
    private final static String CAPTCHA_URL = "https://www.google.com/recaptcha/api/siteverify?secret=%s&response=%s";

    @Autowired
    private UserService userService;
    @Autowired
    private RestTemplate restTemplate;

    @Value("${recaptcha.secret}")
    private String secret;

    @GetMapping("/registration")
    public String viewRegistrationForm() {
        return "registration";
    }

    @PostMapping("/registration")
    public String registerUser(
            @RequestParam("g-recaptcha-response") String reCaptchaResponse,
            @RequestParam String confirmPassword,
            @Valid User user,
            BindingResult bindingResult,
            Model model,
            RedirectAttributes redir) {
        String url = String.format(CAPTCHA_URL, secret, reCaptchaResponse);
        CaptchaResponse captchaResponse = restTemplate.postForObject(url, Collections.emptyList(), CaptchaResponse.class);

        if (StringUtils.isEmpty(confirmPassword) || bindingResult.hasErrors() || !captchaResponse.isSuccess()) {
            Map<String, String> errors = ControllerUtils.getErrors(bindingResult);
            model.mergeAttributes(errors);
            model.addAttribute("confirmPasswordError", "Пароль пользователя должен быть не менее 6 символов!");
            model.addAttribute("captchaError", "Заполните, пожалуйста, капчу!");
            return "registration";
        }

        if (user.getPassword() != null && !user.getPassword().equals(confirmPassword)) {
            model.addAttribute("confirmPasswordError2", "Введённые пароли не совпадают!");
            return "registration";
        }

        if (!userService.addUser(user)) {
            model.addAttribute("userExistsMessage", "Такой пользователь уже существует!");
            return "registration";
        }

        redir.addFlashAttribute("activationMessage", "Для активации пользователя перейдите по ссылке в письме, отправленном на указанный Вами электронный ящик!");
        return "activationMessage";
    }

    @GetMapping("/activate/{code}")
    public String activate(@PathVariable String code, Model model) {
        boolean isActivated = userService.activateUser(code);

        if (isActivated) {
            model.addAttribute("activationSucceedMessage", "Пользователь успешно активирован!");
        } else {
            model.addAttribute("activationFailedMessage", "Код активации не найден!");
        }

        return "login";
    }
}
