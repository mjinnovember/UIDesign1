const form = document.getElementById('form')
const firstname_input = document.getElementById('firstname-input')
const email_input = document.getElementById('email-input')
const password_input = document.getElementById('password-input')
const repeat_password_input = document.getElementById('repeat-password-input')
const error_message = document.getElementById('error-message')

form.addEventListener('submit', (e) => {
    let errors = []

    if(firstname_input){
        // Estamos en SIGNUP
        errors = getSignupFormErrors(firstname_input.value, email_input.value, password_input.value, repeat_password_input.value)
    } else {
        // Estamos en LOGIN
        errors = getLoginFormErrors(email_input.value, password_input.value)
    }

    if(errors.length > 0){ 
        e.preventDefault()
        error_message.innerText = errors.join(". ")
    } else {
        // --- AQUÍ SUCEDE LA MAGIA ---
        e.preventDefault(); // Evitamos que el form refresque la página para manejar la lógica
        
        if(firstname_input) {
            // Guardamos info del registro
            localStorage.setItem('userEmail', email_input.value);
            localStorage.setItem('userPassword', password_input.value);
            localStorage.setItem('usuarioNombre', firstname_input.value);
            
            alert("Signup compleated. Log in!");
            window.location.href = "login.html"; // Redirigir a Login
        } else {
            // Lógica de Login: Verificar si el email coincide con el guardado
            const storedEmail = localStorage.getItem('userEmail');
            
            if(email_input.value === storedEmail) {
                localStorage.setItem('isLoggedIn', 'true');
                window.location.href = "secon-page-website.html"; // Redirigir a Inicio
            } else {
                error_message.innerText = "Couldn't find username. Try again.";
            }
        }
    }
})

function getSignupFormErrors(firstname, email, password, repeatPassword){
    let errors = []

    if (firstname === '' || firstname == null){
        errors.push('First name is required')
        firstname_input.parentElement.classList.add('incorrect')
    }
    if (email === '' || email == null){
        errors.push('Email is required')
        email_input.parentElement.classList.add('incorrect')
    }
    if (password === '' || password == null){
        errors.push('Password is required')
        password_input.parentElement.classList.add('incorrect')
    }
    if (password.length < 8){ // CORREGIDO: length
        errors.push('Password must have at least 8 characters')
        password_input.parentElement.classList.add('incorrect')
    }
    if (password !== repeatPassword){
        errors.push('Passwords do not match') // CORREGIDO: errors (plural)
        password_input.parentElement.classList.add('incorrect')
        repeat_password_input.parentElement.classList.add('incorrect')
    }

    return errors;
}

function getLoginFormErrors(email, password){
    let errors = []
    if (email === '' || email == null){
        errors.push('Email is required')
        email_input.parentElement.classList.add('incorrect')
    }
    if (password === '' || password == null){
        errors.push('Password is required')
        password_input.parentElement.classList.add('incorrect')
    }
    return errors;
}

const allInputs = [firstname_input, email_input, password_input, repeat_password_input].filter(input => input != null)
allInputs.forEach(input =>{
    input.addEventListener('input', () => {
        if(input.parentElement.classList.contains('incorrect')){
            input.parentElement.classList.remove('incorrect')
            error_message.innerText = ''
        }
    })
})
