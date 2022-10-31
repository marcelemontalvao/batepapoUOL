let user = undefined;
let isUserOnline = true;
let canGetMessages = true;
const enterInContainer = document.getElementById("enterIn");
const container = document.getElementById("container");
const form = document.getElementById("form");
let userOnlineInterval = null;
let getMessagesInterval = null;

form.addEventListener('submit', (e)=> {
    e.preventDefault();
    const inputUser = document.getElementById('input-user');
    user = inputUser.value;
    getSetUser();
});

function getSetUser() {
    const name = {
        name: user
    }
    
    const promise = axios.post('https://mock-api.driven.com.br/api/v6/uol/participants', name);
    promise.then((response) => {
        if(response.status == 200) {
            const formUser = document.getElementById("form");
            formUser.innerHTML = '';
            const divSpinner = document.createElement("div");
            divSpinner.classList.add('divSpinner');
            const spinner = document.createElement('img');
            spinner.src = './assets/spinner.png'
            spinner.classList.add('spinner');
            const span = document.createElement("span");
            span.innerText = 'Entrando...';
            divSpinner.append(spinner, span);
            form.append(divSpinner);
            
            setTimeout(()=> {
                container.style.display = 'flex';
                enterInContainer.style.display = 'none';
            }, 1500);
            userOnlineInterval = setInterval(userOnline, 5000)
        }
    }).catch(()=> {
        const formUser = document.getElementById("form");
        const inputUser = document.getElementById("input-user");

        if(form.childNodes.length == 5 && inputUser) {
            const spanAlert = document.createElement("span");
            spanAlert.className = 'span-alert';
            spanAlert.innerText = "Já existe um usuário com esse nome! Digite outro nome de usuário";  
            formUser.append(spanAlert);
        }
    });
}

function getMessages() {
    if (canGetMessages) {
        canGetMessages = false;
        const promise = axios.get('https://mock-api.driven.com.br/api/v6/uol/messages');
        promise.then((response) => {
            renderMessages(response)
            scrollIntoView();
            canGetMessages = true;
        }).catch(() => {
            canGetMessages = true;
        });
    }
}

function userOnline() {
    if(isUserOnline == true) {
        isUserOnline = false;
        const name = {
            name: user
        }
        let promise = axios.post('https://mock-api.driven.com.br/api/v6/uol/status', name)
        promise.then(() => {
            isUserOnline = true;
            console.log('Usuário continua presente');
        }).catch(() => {
            console.log('Saiu da sala');
            window.location.reload();
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
        } else if (element.type == 'private_message' && (element.to == user)) {
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

function scrollIntoView() {
    const ul = document.querySelector('.cards');
    const lastMessage = ul.lastElementChild;
    lastMessage.scrollIntoView();
}

function sendMessage() {
    const form = document.querySelector("footer form");
    const input = document.getElementById('input');
    form.addEventListener("submit", (e)=> { 
        e.preventDefault();
        if(input.value) {
            const promise = axios.post('https://mock-api.driven.com.br/api/v6/uol/messages', message);
            promise.catch(()=> {
                window.location.reload();
            }) 
            input.value = '';
        }
    })

    input.addEventListener('keydown', (e)=> {
        const key = e.code;
        if(key == 'Enter') {
            const message = {
                from: user,
                to: 'Todos',
                text: input.value,
                type: 'message'
            }
        
            if(input.value) {
                const promise = axios.post('https://mock-api.driven.com.br/api/v6/uol/messages', message);
                promise.catch(()=> {
                    window.location.reload();
                }) 
                input.value = '';
            }
        }
    })
}

function openActiveParticipants() {
    const btn = document.getElementById('open-modal');
    let array = [];
    const modal = document.getElementById("active-participants");
    
    btn.addEventListener("click", ()=> {
        modal.style.display = 'flex';
    });

    modal.addEventListener("click", (e)=> {
        if(e.target.className == 'container-active-participants') {
            modal.style.display = 'none';
        }
    });

    const promise = axios.get('https://mock-api.driven.com.br/api/v6/uol/messages');
    setInterval(()=> {
            promise.then((response)=> {
            const participants = document.querySelector(".names");
            const data = response.data;
            
            data.forEach(data => {
                if(!array.includes(data.from)) {
                    array.push(data.from);
                }
            });
            participants.innerHTML = '';
            participants.innerHTML += `
                <div class="participant nameuser">
                    <span ><ion-icon name="people"></ion-icon>Todos</span>
                    <ion-icon name="checkmark"></ion-icon>
                </div>
            ` ;

            array.forEach(nameUser => {
                
                participants.innerHTML += `
                    <div class="participant nameuser">
                        <span><ion-icon name="person-circle"></ion-icon>${nameUser}</span>
                        <ion-icon name="checkmark" class='check'></ion-icon>
                    </div>
                `            
            });
        });
    }, 10000);
}
/*
function selectUser() {
    const namesUser = document.querySelectorAll(".nameuser")
    console.log(namesUser);

    namesUser.forEach(nameUser => {
        console.log(nameUser);
        const ion = nameUser.querySelector('.check')
        if(ion.classList.contains("active")) {
            ion.classList.remove(".active");
        }
        nameUser.addEventListener("click", ()=> {
            const ion = nameUser.querySelector('.check');
            ion.classList.toggle(".active");
        });
    });
}
*/
getMessagesInterval = setInterval(getMessages, 3000);
getMessages();
sendMessage();
openActiveParticipants();
//selectUser();