"use strict";

// Data
const account1 = {
  owner: "Albert Marukyan",
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  address: [],
  pin: 1234,
  movementsDates: [
    "2019-11-18T21:31:17.178Z",
    "2019-12-23T07:42:02.383Z",
    "2020-01-28T09:15:04.904Z",
    "2020-04-01T10:17:24.185Z",
    "2020-05-08T14:11:59.604Z",
    "2021-12-10T17:01:17.194Z",
    "2021-12-17T23:36:17.929Z",
    "2021-12-18T10:51:36.790Z",
  ],
  currency: "EUR",
  locale: "pt-PT", // de-DE
};

const account2 = {
  owner: "Jessica Davis",
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  address: [],
  pin: 2222,
  movementsDates: [
    "2019-11-01T13:15:33.035Z",
    "2019-11-30T09:48:16.867Z",
    "2019-12-25T06:04:23.907Z",
    "2020-01-25T14:18:46.235Z",
    "2020-02-05T16:33:06.386Z",
    "2020-04-10T14:43:26.374Z",
    "2020-06-25T18:49:59.371Z",
    "2020-07-26T12:01:20.894Z",
  ],
  currency: "USD",
  locale: "en-US",
};

const accounts = [account1, account2];

// Elements
const labelWelcome = document.querySelector(".welcome");
const labelDate = document.querySelector(".date");
const labelBalance = document.querySelector(".balance__value");
const labelSumIn = document.querySelector(".summary__value--in");
const labelSumOut = document.querySelector(".summary__value--out");
const labelSumInterest = document.querySelector(".summary__value--interest");
const labelTimer = document.querySelector(".timer");

const containerApp = document.querySelector(".app");
const containerMovements = document.querySelector(".movements");

const btnLogin = document.querySelector(".login__btn");
const btnTransfer = document.querySelector(".form__btn--transfer");
const btnLoan = document.querySelector(".form__btn--loan");
const btnClose = document.querySelector(".form__btn--close");
const btnSort = document.querySelector(".btn--sort");

const inputLoginUsername = document.querySelector(".login__input--user");
const inputLoginPin = document.querySelector(".login__input--pin");
const inputTransferTo = document.querySelector(".form__input--to");
const inputTransferAmount = document.querySelector(".form__input--amount");
const inputLoanAmount = document.querySelector(".form__input--loan-amount");
const inputCloseUsername = document.querySelector(".form__input--user");
const inputClosePin = document.querySelector(".form__input--pin");

let isSorted = false;
const formatNum = (num) =>
  new Intl.NumberFormat(curAcc.locale, {
    style: "currency",
    currency: curAcc.currency,
  }).format(num);
const formatDate = (currDate) => {
  const calcDaysPassed = (dat1, dat2) =>
    Math.round(Math.abs(dat2 - dat1) / (1000 * 60 * 60 * 24));
  const dayPassed = calcDaysPassed(currDate, Date.now());
  if (dayPassed == 0) {
    return "Сегодня";
  } else if (dayPassed == 1) {
    return "Вчера";
  } else if (dayPassed > 1 && dayPassed <= 31) {
    return `${dayPassed - 1} дней назад`;
  } else {
    return new Intl.DateTimeFormat(curAcc.locale).format(currDate);
  }
};
const displayMovements = (arr, sort = false) => {
  let date = new Date();
  labelDate.textContent =
    new Intl.DateTimeFormat(curAcc.locale).format(date) +
    `, ${String(date.getHours()).padStart(2, 0)}:${String(
      date.getMinutes()
    ).padStart(2, 0)}`;

  containerMovements.innerHTML = "";

  const movs = sort
    ? arr.movements.slice().sort((a, b) => a - b)
    : arr.movements;

  movs.forEach((el, i) => {
    const typeOp = el > 0 ? "поступление" : "перевод";
    const typeCl = el > 0 ? "deposit" : "withdrawal";
    const currDate = new Date(arr.movementsDates[i]);
    const html = `
    <div class="movements__row">
      <div class="movements__type movements__type--${typeCl}">${
      i + 1
    } ${typeOp}</div>
      <div class="movements__date">${formatDate(currDate)}</div>
      <div class="movements__value">${formatNum(el)}</div>
    </div>
    `;
    containerMovements.insertAdjacentHTML("afterbegin", html);
    isSorted = sort;
  });
};

const calcBalance = (mov) => {
  const sum = mov.movements.reduce((acm, curr) => acm + curr, 0);
  labelBalance.textContent = formatNum(sum);
  mov.balance = sum;
};

const calcDisplaySummary = (mov) => {
  labelSumIn.textContent = formatNum(
    mov.movements.filter((el) => el >= 0).reduce((acc, el) => acc + el)
  );
  labelSumOut.textContent = formatNum(
    Math.abs(mov.movements.filter((el) => el < 0).reduce((acc, el) => acc + el))
  );
  labelSumInterest.textContent = formatNum(
    mov.movements
      .filter((el) => el >= 0)
      .map((el) => (el * mov.interestRate) / 100)
      .filter((el) => el >= 1)
      .reduce((arr, el) => arr + el)
  );
};

const formUser = (accs) => {
  accs.forEach((acc) => {
    acc.username = acc.owner
      .split(" ")
      .map((el) => el[0].toLowerCase())
      .join("");
  });
};
formUser(accounts);
const updateUI = (curAcc) => {
  // Показать переводы
  displayMovements(curAcc);
  // Посчитать баланс
  calcBalance(curAcc);
  // Посчитать коммисию вход и выход
  calcDisplaySummary(curAcc);
};
let curAcc;

// // FAKE LOGGIN
// curAcc = account1;
// updateUI(curAcc);
// containerApp.style.opacity = 100;

const checkLogIn = (e) => {
  e.preventDefault();
  curAcc = accounts.find(
    (el) =>
      el.username == inputLoginUsername.value && el.pin == inputLoginPin.value
  );
  // Показывает UI  и меняет приветствие
  labelWelcome.textContent = `Добро пожаловать ${curAcc.owner.split(" ")[0]}`;
  containerApp.style.opacity = 100;
  // Почистить поля ввода
  inputLoginPin.value = "";
  inputLoginUsername.value = "";
  // Запустить таймер
  setTimeout(() => {
    containerApp.style.opacity = 0;
    labelWelcome.textContent = `Войдите в аккаунт`;
  }, 5 * 60 * 1000);
  // Изменять время
  let timeExit = 5 * 60;
  setInterval(() => {
    timeExit--;
    let newDat = new Date(timeExit * 1000);
    labelTimer.textContent = `${newDat.getMinutes()}:${String(
      newDat.getSeconds()
    ).padStart(2, 0)}`;
  }, 1000);

  // Обновить ui
  updateUI(curAcc);
};
btnLogin.addEventListener("click", checkLogIn);

btnTransfer.addEventListener("click", function (e) {
  e.preventDefault();
  const toUs = accounts.find((el) => el.username === inputTransferTo.value);
  const amount = Number(inputTransferAmount.value);

  if (
    amount <= curAcc.balance &&
    amount > 0 &&
    toUs &&
    toUs?.username !== curAcc.username
  ) {
    curAcc.movements.push(-amount);
    toUs.movements.push(amount);
    curAcc.address.unshift(toUs.owner);
    toUs.address.unshift(curAcc.owner);
    curAcc.movementsDates.push(new Date());
    toUs.movementsDates.push(new Date());
    updateUI(curAcc);
    inputTransferAmount.value = inputTransferTo.value = "";
  }
});

btnLoan.addEventListener("click", function (e) {
  e.preventDefault();
  const amount = Number(inputLoanAmount.value);
  if (curAcc.movements.some((el) => el > 0 && el >= 0.1 * amount)) {
    setTimeout(() => {
      curAcc.movements.push(amount);
      curAcc.address.unshift("Банка (Кредит)");
      curAcc.movementsDates.push(new Date());
      updateUI(curAcc);
    }, 1500);
  }
  inputLoanAmount.value = "";
});
btnSort.addEventListener("click", function (e) {
  e.preventDefault();
  displayMovements(curAcc, !isSorted);
});
btnClose.addEventListener("click", function (e) {
  e.preventDefault();
  if (
    inputClosePin.value == curAcc.pin &&
    inputCloseUsername.value === curAcc.username
  ) {
    accounts.splice(
      accounts.findIndex((el) => el.username === curAcc.username),
      1
    );
    containerApp.style.opacity = 0;
  }
  inputClosePin.value = inputCloseUsername.value = "";
});
