const BASE_URL = "https://lighthouse-user-api.herokuapp.com"
const INDEX_URL = BASE_URL + "/api/v1/users/"
const USERS_PER_PAGE = 20

const users = []
let filteredUsers = []

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')

function renderUserList(data) {
  let rawHTML = ""

  data.forEach((item) => {
    rawHTML += `
    <div class="card col-sm-2 mt-3 mx-1" style="width: 12rem">
      <img
        class="card-img-top card-avatar mt-3"
        src="${item.avatar}"
        alt="User Avatar"
        data-toggle="modal"
        data-target="#userModal"
        data-id="${item.id}">
      <div class="card-body">
        <h5 class="card-title">${item.name} ${item.surname}</h5>
      </div>
    </div>
  </div>
    `
  })
  dataPanel.innerHTML = rawHTML
}

// USER MODAL
function showUserModal(id) {
  const modalTitle = document.querySelector('#user-modal-title')
  const modalBody = document.querySelector('#user-modal-body')
  const modalFooter = document.querySelector('.modal-footer')

  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data
    modalTitle.innerText = `${data.name} ${data.surname}`
    modalBody.innerHTML = `
      <ul>
        <li id="user-modal-age">Age: ${data.age}</li>
        <li id="user-modal-region">region: ${data.region}</li>
        <li id="user-modal-gender">gender: ${data.gender}</li>
        <li id="user-modal-birthday">birthday: ${data.birthday}</li>
         <li id="user-modal-email">email: ${data.email}</li>
      </ul>
    `
  })
}

// GET USERS IN THE PAGE
function getUsersByPage(page){
  const data = filteredUsers.length ? filteredUsers : users
  const startIndex = (page - 1) * USERS_PER_PAGE
  return data.slice(startIndex, (startIndex +  USERS_PER_PAGE))
}


// RENDER PAGINATOR
function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / USERS_PER_PAGE)
  let rawHTML = ''

  for(let page = 1; page <= numberOfPages; page++){
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }

  paginator.innerHTML = rawHTML
}


//  MODAL CLICKED 
dataPanel.addEventListener('click', function onPanelClicked(event){
  if (event.target.matches('.card-avatar')) {
    showUserModal(Number(event.target.dataset.id))
  }
})

// PAGINATOR CLICKED
paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return
  const page = Number(event.target.dataset.page)
  renderUserList(getUsersByPage(page))
})


// SEARCH FORM
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()
  const searchInputValue = searchInput.value
  const keyword = searchInputValue.trim().toLowerCase()

  if(searchInputValue.trim() === ''){
    searchInput.classList.add('is-invalid')
  } else {
    filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(keyword) ||
    user.surname.toLowerCase().includes(keyword))
    searchInput.classList.remove('is-invalid')
  }
  
  if (filteredUsers.length === 0) {
    searchInput.value = ''
    renderUserList(users)
    return alert(`Cannot find any user with keyword: ${searchInputValue}`)
  }

  renderPaginator(filteredUsers.length)
  renderUserList(getUsersByPage(1))
  searchInput.value = ''
})



axios.get(INDEX_URL).then((response) => {
  const allUsersData = response.data.results
  users.push(...allUsersData)
  renderPaginator(users.length)
  renderUserList(getUsersByPage(1))
})
