"use strict";
const account1 = {
  owner: "Jonas Schmedtmann",
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    "2019-11-18T21:31:17.178Z",
    "2019-12-23T07:42:02.383Z",
    "2020-01-28T09:15:04.904Z",
    "2020-04-01T10:17:24.185Z",
    "2020-05-08T14:11:59.604Z",
    "2020-05-27T17:01:17.194Z",
    "2022-04-25T23:36:17.929Z",
    "2022-04-27T10:51:36.790Z",
  ],
  currency: "EUR",
  locale: "pt-PT", // de-DE
};

const account2 = {
  owner: "Jessica Davis",
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
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

const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

//Create Usernames
const createUsername = function (curacc) {
  curacc.forEach((acc) => {
    acc.username = acc.owner
      .toLowerCase()
      .split(" ")
      .map((e) => e[0])
      .join("");
  });
};
createUsername(accounts);

//Movements
const balanceValue = document.querySelector(".balance__value");

const movementsDate = document.querySelector(".movements__date");
const movementsType = document.querySelector(".movements__type");

//App
const wholeApp = document.querySelector(".app");
const movementsApp = document.querySelector(".movements");
//Login
const welcome = document.querySelector(".welcome");

const btnLogin = document.querySelector(".login__btn");
const loginUI = document.querySelector(".login__input--user");
const loginPin = document.querySelector(".login__input--pin");

const curFormat = function (value, locale, currency) {
  const optionsNum = {
    style: "currency",
    currency: currency,
  };
  return new Intl.NumberFormat(locale, optionsNum).format(value);
};

const dateFormat = function (date, locale) {
  const daysPassed = (day1, day2) =>
    Math.round(Math.abs((day2 - day1) / (1000 * 60 * 60 * 24)));
  const daysPassedBetween = daysPassed(new Date(), date);
  console.log(daysPassedBetween);
  if (daysPassedBetween === 0) return "Today";
  if (daysPassedBetween === 1) return "Yesterday";
  if (daysPassedBetween >= 2 && daysPassedBetween <= 7)
    return `${daysPassedBetween} Days ago`;
  if (daysPassedBetween > 7)
    return new Intl.DateTimeFormat(locale).format(date);

  return new Intl.DateTimeFormat(locale).format(date);
};

//Calculate Balance
const balanceCalculator = function (curacc) {
  curacc.balance = curacc.movements.reduce((acc, cur) => acc + cur, 0);
  balanceValue.textContent = curFormat(
    curacc.balance,
    curacc.locale,
    curacc.currency
  );
};

//Display In/Out/Interest
const summaryValueIn = document.querySelector(".summary__value--in");
const summaryValueOut = document.querySelector(".summary__value--out");
const summaryValueInterest = document.querySelector(
  ".summary__value--interest"
);
const displaySummaryMovements = function (curacc) {
  const inValue = curacc.movements
    .filter((mov) => mov > 0)
    .reduce((acc, cur) => acc + cur, 0);
  summaryValueIn.textContent = curFormat(
    inValue,
    curacc.locale,
    curacc.currency
  );
  const outValue = curacc.movements
    .filter((mov) => mov < 0)
    .reduce((acc, cur) => acc + cur, 0);
  summaryValueOut.textContent = curFormat(
    Math.abs(outValue),
    curacc.locale,
    curacc.currency
  );
  const interestRate = curacc.movements
    .filter((mov) => mov > 0)
    .map((deposit) => (deposit * curacc.interestRate) / 100)
    .filter((int, i, arr) => int >= 1)
    .reduce((acc, curr) => acc + curr, 0);
  summaryValueInterest.textContent = curFormat(
    interestRate,
    curacc.locale,
    curacc.currency
  );
};

//Display Movements
const displayMovements = function (curacc, sort = false) {
  movementsApp.innerHTML = " ";
  const sorted = sort
    ? curacc.movements.slice().sort((a, b) => a - b)
    : curacc.movements;
  sorted.forEach((mov, i) => {
    const type = mov > 0 ? "deposit" : "withdrawal";

    const date = new Date(curacc.movementsDates[i]);
    const displayDate = dateFormat(date, curacc.locale);
    const movementFormat = curFormat(mov, curacc.locale, curacc.currency);
    const html = `<div class="movements__row">
  <div class="movements__type movements__type--${type}">${type}</div>
  <div class="movements__date">${displayDate}</div>
  <div class="movements__value">${movementFormat}</div>`;
    movementsApp.insertAdjacentHTML("afterbegin", html);
  });
};

//Udate UI
const updateUI = function (acc) {
  displayMovements(acc);
  displaySummaryMovements(acc);
  balanceCalculator(acc);
};
//timer

const logoutTimer = document.querySelector(".timer");

const startLogoutTimer = function () {
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);
    logoutTimer.textContent = `${min}:${sec}`;
    if (time === 0) {
      clearInterval(timeInterval);
      welcome.textContent = "Log in to get started";
      wholeApp.style.opacity = 0;
    }
    time--;
  };
  let time = 60 * 5;
  tick();
  const timeInterval = setInterval(tick, 1000);
  return timeInterval;
};

const labelDate = document.querySelector(".date");
//Login
let currentAccount, timeInterval;
btnLogin.addEventListener("click", function (e) {
  e.preventDefault();
  currentAccount = accounts.find((acc) => acc.username === loginUI.value);
  console.log(currentAccount);
  if (
    loginUI.value === currentAccount?.username &&
    Number(loginPin.value) === currentAccount?.pin
  ) {
    wholeApp.style.opacity = 100;
    loginUI.value = loginPin.value = "";
    loginPin.blur();
    welcome.textContent = `Welcome back, ${currentAccount.owner.split(" ")[0]}`;
  }
  //new date
  const date = new Date();
  labelDate.textContent = new Intl.DateTimeFormat(currentAccount.locale, {
    hour: "numeric",
    minute: "numeric",
    day: "numeric",
    month: "numeric",
    year: "2-digit",
  }).format(date);

  //Start/Restart logout timer
  if (timeInterval) clearInterval(timeInterval);
  timeInterval = startLogoutTimer();

  updateUI(currentAccount);
});

//Sort button
const btnSort = document.querySelector(".btn--sort");
let sorted = false;
btnSort.addEventListener("click", function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
  clearInterval(timeInterval);
  timeInterval = startLogoutTimer();
});
//Transfer button
const btnTransfer = document.querySelector(".form__btn--transfer");
const inputTransfer = document.querySelector(".form__input--amount");
const inputTransferTo = document.querySelector(".form__input--to");
btnTransfer.addEventListener("click", function (e) {
  e.preventDefault();
  const amount = +inputTransfer.value;
  const inputAcc = accounts.find(
    (acc) => acc.username === inputTransferTo.value
  );
  inputTransferTo.value = inputTransfer.value = "";
  console.log(inputAcc);
  console.log(typeof amount);

  if (
    amount > 0 &&
    inputAcc &&
    currentAccount.balance >= amount &&
    inputAcc?.username !== currentAccount.username
  ) {
    currentAccount.movements.push(-amount);
    inputAcc.movements.push(amount);
    currentAccount.movementsDates.push(new Date().toISOString());
    inputAcc.movementsDates.push(new Date().toISOString());
    updateUI(currentAccount);
    clearInterval(timeInterval);
    timeInterval = startLogoutTimer();
  }
});

//Request loan
const btnLoan = document.querySelector(".form__btn--loan");
const inputLoan = document.querySelector(".form__input--loan-amount");
btnLoan.addEventListener("click", function (e) {
  e.preventDefault();
  const amount = Math.floor(+inputLoan.value);
  if (
    amount > 0 &&
    currentAccount.movements.some((mov) => mov > amount * 0.1)
  ) {
    currentAccount.movements.push(amount);
    currentAccount.movementsDates.push(new Date().toISOString());
    inputLoan.value = "";
    updateUI(currentAccount);
    clearInterval(timeInterval);
    timeInterval = startLogoutTimer();
  }
});
//Close account
const btnClose = document.querySelector(".form__btn--close");
const inputCloseUI = document.querySelector(".form__input--user");
const inputPin = document.querySelector(".form__input--pin");
btnClose.addEventListener("click", function (e) {
  e.preventDefault();
  if (
    inputCloseUI.value === currentAccount?.username &&
    +inputPin.value === currentAccount?.pin
  ) {
    const index = accounts.findIndex(
      (acc) => acc.username === currentAccount.username
    );
    accounts.splice(index, 1);
  }
  clearInterval(timeInterval);
  wholeApp.style.opacity = 0;
  inputCloseUI = inputPin = "";
  welcome.textContent = "Log in to get started";
});
