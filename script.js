'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Albert Marukyan',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  address: [],
  pin: 1234,
  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2021-12-10T17:01:17.194Z',
    '2021-12-17T23:36:17.929Z',
    '2021-12-18T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  address: [],
  pin: 2222,
  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

let isSorted = false;
const formatNum = num =>
  new Intl.NumberFormat(curAcc.locale, {
    style: 'currency',
    currency: curAcc.currency,
  }).format(num);
const formatDate = currDate => {
  const calcDaysPassed = (dat1, dat2) =>
    Math.round(Math.abs(dat2 - dat1) / (1000 * 60 * 60 * 24));
  const dayPassed = calcDaysPassed(currDate, Date.now());
  if (dayPassed == 0) {
    return 'Сегодня';
  } else if (dayPassed == 1) {
    return 'Вчера';
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

  containerMovements.innerHTML = '';

  const movs = sort
    ? arr.movements.slice().sort((a, b) => a - b)
    : arr.movements;

  movs.forEach((el, i) => {
    const typeOp = el > 0 ? 'поступление' : 'перевод';
    const typeCl = el > 0 ? 'deposit' : 'withdrawal';
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
    // <div class="movements__date">${
    //     (typeCl == 'deposit' ? 'от ' : 'к ') +
    //     (arr?.address?.at(arr.movements.length - i - 1) ?? 'Анонима')
    //   }</div>
    containerMovements.insertAdjacentHTML('afterbegin', html);
    isSorted = sort;
  });
};

const calcBalance = mov => {
  const sum = mov.movements.reduce((acm, curr) => acm + curr, 0);
  labelBalance.textContent = formatNum(sum);
  mov.balance = sum;
};

const calcDisplaySummary = mov => {
  labelSumIn.textContent = formatNum(
    mov.movements.filter(el => el >= 0).reduce((acc, el) => acc + el)
  );
  labelSumOut.textContent = formatNum(
    Math.abs(mov.movements.filter(el => el < 0).reduce((acc, el) => acc + el))
  );
  labelSumInterest.textContent = formatNum(
    mov.movements
      .filter(el => el >= 0)
      .map(el => (el * mov.interestRate) / 100)
      .filter(el => el >= 1)
      .reduce((arr, el) => arr + el)
  );
};

const formUser = accs => {
  accs.forEach(acc => {
    acc.username = acc.owner
      .split(' ')
      .map(el => el[0].toLowerCase())
      .join('');
  });
};
formUser(accounts);
const updateUI = curAcc => {
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

const checkLogIn = e => {
  e.preventDefault();
  curAcc = accounts.find(
    el =>
      el.username == inputLoginUsername.value && el.pin == inputLoginPin.value
  );
  // Показывает UI  и меняет приветствие
  labelWelcome.textContent = `Добро пожаловать ${curAcc.owner.split(' ')[0]}`;
  containerApp.style.opacity = 100;
  // Почистить поля ввода
  inputLoginPin.value = '';
  inputLoginUsername.value = '';
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
btnLogin.addEventListener('click', checkLogIn);

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const toUs = accounts.find(el => el.username === inputTransferTo.value);
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
    inputTransferAmount.value = inputTransferTo.value = '';
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Number(inputLoanAmount.value);
  if (curAcc.movements.some(el => el > 0 && el >= 0.1 * amount)) {
    setTimeout(() => {
      curAcc.movements.push(amount);
      curAcc.address.unshift('Банка (Кредит)');
      curAcc.movementsDates.push(new Date());
      updateUI(curAcc);
    }, 1500);
  }
  inputLoanAmount.value = '';
});
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(curAcc, !isSorted);
});
btnClose.addEventListener('click', function (e) {
  e.preventDefault();
  if (
    inputClosePin.value == curAcc.pin &&
    inputCloseUsername.value === curAcc.username
  ) {
    accounts.splice(
      accounts.findIndex(el => el.username === curAcc.username),
      1
    );
    containerApp.style.opacity = 0;
  }
  inputClosePin.value = inputCloseUsername.value = '';
});
// const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];
// const balance = movements.reduce((acc, el) => {
//   return acc + el;
// }, 3000);
// console.log(balance);
/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

// const currencies = new Map([
//   ['USD', 'United States dollar'],
//   ['EUR', 'Euro'],
//   ['GBP', 'Pound sterling'],
// ]);

// /////////////////////////////////////////////////

// movements.forEach((el, ind) => {
//   el > 0
//     ? console.log(`Операция ${ind + 1}: Вы внесли ${el}`)
//     : console.log(`Операция ${ind + 1}: Вы сняли ${el}`);
// });

// let a = 'hell'.split('');
// console.log(a.at(-2));

///////////////////////////////////////
// Coding Challenge #1

/* 
Julia and Kate are doing a study on dogs. So each of them asked 5 dog owners about their dog's age, and stored the data into an array (one array for each). For now, they are just interested in knowing whether a dog is an adult or a puppy. A dog is an adult if it is at least 3 years old, and it's a puppy if it's less than 3 years old.

Create a function 'checkDogs', which accepts 2 arrays of dog's ages ('dogsJulia' and 'dogsKate'), and does the following things:

1. Julia found out that the owners of the FIRST and the LAST TWO dogs actually have cats, not dogs! So create a shallow copy of Julia's array, and remove the cat ages from that copied array (because it's a bad practice to mutate function parameters)
2. Create an array with both Julia's (corrected) and Kate's data
3. For each remaining dog, log to the console whether it's an adult ("Dog number 1 is an adult, and is 5 years old") or a puppy ("Dog number 2 is still a puppy 🐶")
4. Run the function for both test datasets

HINT: Use tools from all lectures in this section so far 😉

TEST DATA 1: Julia's data [3, 5, 2, 12, 7], Kate's data [4, 1, 15, 8, 3]
TEST DATA 2: Julia's data [9, 16, 6, 8, 3], Kate's data [10, 5, 6, 1, 4]

// GOOD LUCK 😀
// */

// const checkDogs = (jArr, kArr) => {
//   let jArrCorr = jArr.slice(1, -2);
//   const jkArr = [...jArrCorr, ...kArr];
//   jkArr.forEach((el, i) => {
//     console.log(
//       el >= 3
//         ? `Dog number ${i + 1} is an adult, and is ${el} years old`
//         : `Dog number ${i + 1} is still a puppy 🐶`
//     );
//   });
// };
// checkDogs([9, 16, 6, 8, 3], [10, 5, 6, 1, 4]);
// // MAP
// console.log(account1.movements.map(i => i * 2));
// // FILTER
// console.log(account1.movements.filter(i => i > 1000));
// // REDUCE
// console.log(account1.movements.reduce((i, n) => i + n - 1000));

//BIG NUMBERS
// const a = [9, 7, 5];
// console.log(
//   a.reduce((s, i) => {
//     let [first, ...others] = String(s);
//     let sum = String(i + Number(first)) + others.join('');
//     console.log(sum, others);
//     return sum;
//   })
// );

// Maximum
// const maxNum = account1.movements.reduce(
//   (acc, mov) => (mov > acc ? mov : acc),
//   0
// );
// console.log(maxNum);

///////////////////////////////////////
// Coding Challenge #2

/* 
Let's go back to Julia and Kate's study about dogs. This time, they want to convert dog ages to human ages and calculate the average age of the dogs in their study.

Create a function 'calcAverageHumanAge', which accepts an arrays of dog's ages ('ages'), and does the following things in order:

1. Calculate the dog age in human years using the following formula: if the dog is <= 2 years old, humanAge = 2 * dogAge. If the dog is > 2 years old, humanAge = 16 + dogAge * 4.
2. Exclude all dogs that are less than 18 human years old (which is the same as keeping dogs that are at least 18 years old)
3. Calculate the average human age of all adult dogs (you should already know from other challenges how we calculate averages 😉)
4. Run the function for both test datasets

TEST DATA 1: [5, 2, 4, 1, 15, 8, 3] - 44
TEST DATA 2: [16, 6, 10, 5, 6, 1, 4]*/

// const calcAverageHumanAge = function (arr) {
//   let humanYears = arr
//     .map(el => (el <= 2 ? 2 * el : 16 + el * 4))
//     .filter(el => el >= 18);
//   return Math.trunc(
//     humanYears.reduce((acc, curr, i, carr) => acc + curr / carr.length, 0)
//   );
// };
// console.log(calcAverageHumanAge([16, 6, 10, 5, 6, 1, 4]));

///////////////////////////////////////
// Coding Challenge #3

/* 
Rewrite the 'calcAverageHumanAge' function from the previous challenge, but this time as an arrow function, and using chaining!

TEST DATA 1: [5, 2, 4, 1, 15, 8, 3]
TEST DATA 2: [16, 6, 10, 5, 6, 1, 4]

GOOD LUCK 😀
*/

// arr.find(el => el.property = 9) //один элемент подходязий условию

// // console.log(account1.movements.some(el => el > 0));
// // console.log(account1.movements.every(el => el > 0));
// const arr1 = [-300, 100, 400, -133, 5545];
// // console.log(arr1.flat()); //  [1, 3, 4, 5, 6, 7, 8, 9]
// arr1.sort((a, b) => (a > b ? -1 : 1));
// console.log(arr1.sort((a, b) => (a > b ? -1 : 1))); // по убыванию
// console.log(arr1.sort((a, b) => (a < b ? -1 : 1))); // по возрастанию

// console.log(Array.from({ length: 5 }, () => 2)); //  [2, 2, 2, 2, 2]
// console.log(Array.from({ length: 5 }, (cur, i) => i + 1)); //  [1, 2, 3, 4, 5]

// console.log(
//   Array.from({ length: 100 }, () => Math.trunc(Math.random() * 6 + 1))
// );
// console.log(Array.from(document.querySelectorAll(el), (el) => el));

// function anagrams(word, words) {
//   let wordsNew = words.filter(el => {
//     return (
//       JSON.stringify(
//         word.split('').reduce((acc, cur) => {
//           acc[cur] ? acc[cur]++ : (acc[cur] = 1);
//           return acc;
//         }, {})
//       ) ==
//       JSON.stringify(
//         el.split('').reduce((acc, cur) => {
//           acc[cur] ? acc[cur]++ : (acc[cur] = 1);
//           return acc;
//         }, {})
//       )
//     );
//   });
//   return wordsNew;
// }
// anagrams('abba', ['aabb', 'abcd', 'bbaa', 'dada']);
// anagrams('racer', ['crazer', 'carer', 'racar', 'caers', 'racer']);
// anagrams('laser', ['lazing', 'lazy', 'lacer']);

// function rot13(message) {
//   return String.fromCharCode(
//     ...message.split('').map(el => {
//       console.log(
//         el,
//         el.charCodeAt(),
//         String.fromCharCode(el.charCodeAt() + 13)
//       );
//       return el.charCodeAt(0) + 13;
//     })
//   );
//   //your code here
// }
// console.log(rot13('test'));
// console.log('B'.charCodeAt(0));
// console.log(String.fromCharCode(65));

///////////////////////////////////////
// Coding Challenge #4

/* 
Julia and Kate are still studying dogs, and this time they are studying if dogs are eating too much or too little.
Eating too much means the dog's current food portion is larger than the recommended portion, and eating too little is the opposite.
Eating an okay amount means the dog's current food portion is within a range 10% above and 10% below the recommended portion (see hint).

1. Loop over the array containing dog objects, and for each dog, calculate the recommended food portion and add it to the object as a new property. Do NOT create a new array, simply loop over the array. Forumla: recommendedFood = weight ** 0.75 * 28. (The result is in grams of food, and the weight needs to be in kg)
2. Find Sarah's dog and log to the console whether it's eating too much or too little. HINT: Some dogs have multiple owners, so you first need to find Sarah in the owners array, and so this one is a bit tricky (on purpose) 🤓
3. Create an array containing all owners of dogs who eat too much ('ownersEatTooMuch') and an array with all owners of dogs who eat too little ('ownersEatTooLittle').
4. Log a string to the console for each array created in 3., like this: "Matilda and Alice and Bob's dogs eat too much!" and "Sarah and John and Michael's dogs eat too little!"
5. Log to the console whether there is any dog eating EXACTLY the amount of food that is recommended (just true or false)
6. Log to the console whether there is any dog eating an OKAY amount of food (just true or false)
7. Create an array containing the dogs that are eating an OKAY amount of food (try to reuse the condition used in 6.)
8. Create a shallow copy of the dogs array and sort it by recommended food portion in an ascending order (keep in mind that the portions are inside the array's objects)

HINT 1: Use many different tools to solve these challenges, you can use the summary lecture to choose between them 😉
HINT 2: Being within a range 10% above and below the recommended portion means: current > (recommended * 0.90) && current < (recommended * 1.10). Basically, the current portion should be between 90% and 110% of the recommended portion.

TEST DATA:
const dogs = [
  { weight: 22, curFood: 250, owners: ['Alice', 'Bob'] },
  { weight: 8, curFood: 200, owners: ['Matilda'] },
  { weight: 13, curFood: 275, owners: ['Sarah', 'John'] },
  { weight: 32, curFood: 340, owners: ['Michael'] }
];

GOOD LUCK 😀
*/
// function eatingFood(arr) {
//   arr.forEach(el => (el.recommendedFood = el.weight ** 0.75 * 28));
//   const sarDog = arr.find(el => el.owners.includes('Sarah'));
//   console.log(
//     sarDog.curFood >= sarDog.recommendedFood * 0.9 &&
//       sarDog.curFood <= sarDog.recommendedFood * 1.1
//   );
//   const ownersEatTooLittle = arr
//     .filter(el => el.curFood < el.recommendedFood * 0.9)
//     .flatMap(el => el.owners);
//   const ownersEatTooMuch = arr
//     .filter(el => el.curFood > el.recommendedFood * 1.1)
//     .flatMap(el => el.owners);

//   console.log(
//     `${ownersEatTooLittle.join(', and ')}'s dogs eat too little`,
//     `${ownersEatTooMuch.join(', and ')}'s dogs eat too much`
//   );
//   console.log(arr.some(el => el.recommendedFood === el.curFood));
//   console.log(
//     arr.some(
//       el =>
//         el.curFood >= el.recommendedFood * 0.9 &&
//         el.curFood <= el.recommendedFood * 1.1
//     )
//   );
//   const okayFood = arr.filter(
//     el =>
//       el.curFood >= el.recommendedFood * 0.9 &&
//       el.curFood <= el.recommendedFood * 1.1
//   );
//   console.log(okayFood);
//   console.log(
//     arr.slice().sort((a, b) => a.recommendedFood - b.recommendedFood)
//   );
// }
// const dogs = [
//   { weight: 22, curFood: 250, owners: ['Alice', 'Bob'] },
//   { weight: 8, curFood: 200, owners: ['Matilda'] },
//   { weight: 13, curFood: 275, owners: ['Sarah', 'John'] },
//   { weight: 32, curFood: 340, owners: ['Michael'] },
// ];
// eatingFood(dogs);
