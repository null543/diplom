document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();

    var formData = {
        nickname: document.getElementById('nickname').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
    };

    fetch('https://localhost:7292/api/Users/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
    })
    
    .then(response => response.json())
    .then(data => console.log(data))
    .catch((error) => {
        console.error('Error:', error);
    });
});
