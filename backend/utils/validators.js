const validateEmail = (email) => {
    return /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
        String(email).toLowerCase(),
    );
};

const validatePassword = (password) => {
    return /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(
        String(password),
    );
};

const validateSlug = (slug) => {
    return /^[a-z0-9-]{3,}$/.test(String(slug).toLowerCase());
};

export { validateEmail, validatePassword, validateSlug };
