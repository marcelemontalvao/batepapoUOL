let user = undefined;
let isUserOnline = true;
const enterInContainer = document.getElementById("enterIn");
const container = document.getElementById("container");
const form = document.getElementById("form");

form.addEventListener('submit', (e)=> {
    e.preventDefault();
    const inputUser = document.getElementById('input-user');
    if(typeof(inputUser.value) == 'string') {
        container.style.display = 'flex';
        enterInContainer.style.display = 'none';
        user = inputUser.value;
        getUser();
    }
});

function getUser() {
    const name = {
        name: user
    }
    
    const promise = axios.post('https://mock-api.driven.com.br/api/v6/uol/participants', name);
    promise.then((response) => {
        if(response.status == 200) {
            getMessages();
            setInterval(userOnline, 5000)
        }
    }).catch(()=> {
        if(response.status == 400) {
            alert("Já existe um usuário com esse nome!");
            user = prompt("Qual o seu nome?");
        }
    });
}

function getMessages() {
   const promise = axios.get('https://mock-api.driven.com.br/api/v6/uol/messages')
   promise.then((response) => {
        renderMessages(response)
        scrollIntoView();
   });
}

function userOnline() {
    if(isUserOnline == true) {
        isUserOnline = false; 
        const name = {
            name: user
        }
        const promise = axios.post('https://mock-api.driven.com.br/api/v6/uol/participants', name)
        promise.then(() => {
            isUserOnline = true;
        }).catch(()=> {
            console.log('Saiu da sala');
            if(confirm(`${user}, você continua aí?`)) {
                getMessages()
            } else {
                window.location.reload();
            }
            isUserOnline = true;
        })
    }
}

function renderMessages(response) {
    const ul = document.querySelector(".cards");
    ul.innerHTML = "";
    
    const data = response.data;
    data.forEach(element => { 
        const li = document.createElement("li");
        li.classList.add("card");

        const divInfo = document.createElement('div');
        divInfo.classList.add('info');

        const spanTime = document.createElement('time');
        spanTime.classList.add('time');
        spanTime.innerText =`(${element.time})`; 
        
        const spanPerson = document.createElement('span')
        spanPerson.classList.add('from');
        spanPerson.innerText = element.from;

        const spanText = document.createElement('span')
        spanText.classList.add('text');
        spanText.innerText = ` ${element.text}`;

        if(element.type == 'status') {
            li.classList.add('status');

            divInfo.append(spanTime, spanPerson, spanText);
            li.append(divInfo);
            ul.append(li);
        } else if (element.type == 'private' && element.to == user) {
            li.classList.add('private');

            const spanTo = document.createElement('span')
            spanTo.classList.add('to');
            spanTo.innerText = ` reservadamente para ${element.to}:`;

            divInfo.append(spanTime, spanPerson, spanTo, spanText);
            li.append(divInfo);
            ul.append(li);
        } else {
            li.classList.add('message')

            const spanTo = document.createElement('span')
            spanTo.classList.add('to');
            spanTo.innerText = ` para ${element.to}:`;

            divInfo.append(spanTime, spanPerson, spanTo, spanText);
            li.append(divInfo);
            ul.append(li);
        }
    });
}

function update() {
    setInterval(getMessages, 3000);
}

function scrollIntoView() {
    const ul = document.querySelector('.cards');
    const lastMessage = ul.lastElementChild;
    lastMessage.scrollIntoView();
}

function sendMessage() {
    const input = document.getElementById('input');
    const btn = document.getElementById('btn-send');

    btn.addEventListener('click', () => {
        const message = {
            from: user,
            to: 'Todos',
            text: input.value,
            type: 'message'
        }

        const promise = axios.post('https://mock-api.driven.com.br/api/v6/uol/messages', message);
        promise.then(()=> {
            getMessages();
            input.value = '';
        }).catch(()=> {
            window.location.reload();
        })
    })

}

getMessages();
update();
sendMessage();