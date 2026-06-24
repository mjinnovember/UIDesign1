document.addEventListener("DOMContentLoaded", function() {
    // --- ANIMACIÓN DE MÁQUINA DE ESCRIBIR CORREGIDA ---
    const textoDestino = "Welcome to\nEverywhere Library.";
    const contenedorTexto = document.getElementById('typing-text');
    let indice = 0;

    function ejecutarAnimacionEscritura() {
        if (contenedorTexto && indice < textoDestino.length) {
            // Obtenemos el fragmento de texto procesado hasta el momento
            const textoActual = textoDestino.substring(0, indice + 1);
            
            // Renderizamos el texto seguido del span del cursor inline
            contenedorTexto.innerHTML = `${textoActual}<span class="cursor">|</span>`;
            
            indice++;
            setTimeout(ejecutarAnimacionEscritura, 90);
        } else if (contenedorTexto) {
            // Al terminar la animación, removemos el elemento del cursor
            const cursorElement = contenedorTexto.querySelector('.cursor');
            if (cursorElement) {
                cursorElement.remove();
            }
        }
    }
    
    // Lanzar animación
    ejecutarAnimacionEscritura();
});

// --- LÓGICA EXISTENTE DE VALIDACIÓN ---
const form = document.getElementById('form')
const firstname_input = document.getElementById('firstname-input')
const email_input = document.getElementById('email-input')
const password_input = document.getElementById('password-input')
const repeat_password_input = document.getElementById('repeat-password-input')
const error_message = document.getElementById('error-message')

form.addEventListener('submit', (e) => {
    let errors = []

    if(firstname_input){
        errors = getSignupFormErrors(firstname_input.value, email_input.value, password_input.value, repeat_password_input.value)
    } else {
        errors = getLoginFormErrors(email_input.value, password_input.value)
    }

    if(errors.length > 0){ 
        e.preventDefault()
        error_message.innerText = errors.join(". ")
    } else {
        e.preventDefault(); 
        
        if(firstname_input) {
            localStorage.setItem('userEmail', email_input.value);
            localStorage.setItem('userPassword', password_input.value);
            localStorage.setItem('usuarioNombre', firstname_input.value);
            
            alert("Signup completed. Log in!");
            window.location.href = "login.html"; 
        } else {
            const storedEmail = localStorage.getItem('userEmail');
            const storedPass = localStorage.getItem('userPassword');
            
            // Verificación completa de email y contraseña correspondientes
            if(email_input.value === storedEmail && password_input.value === storedPass) {
                localStorage.setItem('isLoggedIn', 'true');
                window.location.href = "welcome-page.html";
            } else {
                error_message.innerText = "Invalid credentials. Try again.";
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
    if (password && password.length < 8){ 
        errors.push('Password must have at least 8 characters')
        password_input.parentElement.classList.add('incorrect')
    }
    if (password !== repeatPassword){
        errors.push('Passwords do not match') 
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
