
console.log('working');

function getValue(id) {
    return document.getElementById(id)
}

async function submit() {
    const name = getValue("name").value;
    const email = getValue("email").value;
    const password = getValue("password").value;
    if (name && email && password) {
        chrome.runtime.sendMessage({ message: 'signup', payload: { name, email, password } })
    }
}
document.addEventListener('DOMContentLoaded', async () => {
    const signupform = document.querySelector('form');
    const login = document.getElementById("login");
    if (signup) {
        signupform.addEventListener('submit', async (event) => {
            event.preventDefault();
            await submit();
        })
    }
    if (login) {
        login.addEventListener('click', () => {
            location.replace('../login/index.html')
        })
    }
})

// lisiten message
chrome.runtime.onMessage.addListener((request, sender) => {
    const status = document.getElementById('status');
    if (request.message === "signup" && request.data.status) {
        status.innerText = "Successfully registered"
        status.style.color = "green" ;
        document.querySelector('form').reset()
    } else {
        status.innerText = request.data.message;
        status.style.color = "red" ;
        // document.querySelector('form').reset()

    }
})