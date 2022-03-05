const Utils = {
  formatAmount(value) {
    return Number(value) * 100;
  },
  formatCurrency(value) {
    const signal = Number(value) < 0 ? "-" : "";
    value = String(value).replace(/\D/, "");
    value = Number(value) / 100;
    value = value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
    return signal + value;
  },
  formatDate(date) {
    const splittedDate = date.split("-");
    return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`;
  },
};

const Modal = {
  open() {
    document.querySelector(".modal-overlay").classList.add("active");
  },
  close() {
    document.querySelector(".modal-overlay").classList.remove("active");
  },
};

const Storage = {
  get() {
    return JSON.parse(localStorage.getItem("dev.finances:transactions")) || [];
  },
  set(transactions) {
    localStorage.setItem(
      "dev.finances:transactions",
      JSON.stringify(transactions)
    );
  },
};

const Transaction = {
  all: Storage.get(),
  add(transaction) {
    this.all.push(transaction);
    App.reload();
  },
  remove(index) {
    this.all.splice(index, 1);
    App.reload();
  },
  sumIncomes() {
    return this.all
      .filter((transaction) => transaction.amount >= 0)
      .reduce((acc, cur) => acc + cur["amount"], 0);
  },
  sumExpenses() {
    return this.all
      .filter((transaction) => transaction.amount < 0)
      .reduce((acc, cur) => acc + cur["amount"], 0);
  },
  sumTotal() {
    return this.sumIncomes() + this.sumExpenses();
  },
};

const DOM = {
  transactionsContainer: document.querySelector("#data-table tbody"),
  addTransaction(transaction, index) {
    const tr = document.createElement("tr");
    tr.innerHTML = this.innerHTMLTransaction(transaction, index);
    tr.dataset.index = index;
    this.transactionsContainer.appendChild(tr);
  },
  innerHTMLTransaction(transaction, index) {
    const CSSclass = transaction.amount > 0 ? "income" : "expense";
    const amount = Utils.formatCurrency(transaction.amount);
    const html = `
      <td class="description">${transaction.description}</td>
      <td class="${CSSclass}">${amount}</td>
      <td class="date">${transaction.date}</td>
      <td><img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação" /></td>
      `;
    return html;
  },
  updateBalance() {
    document.querySelector("#incomesDisplay").innerHTML = Utils.formatCurrency(
      Transaction.sumIncomes(transactions)
    );
    document.querySelector("#expensesDisplay").innerHTML = Utils.formatCurrency(
      Transaction.sumExpenses()
    );
    document.querySelector("#totalDisplay").innerHTML = Utils.formatCurrency(
      Transaction.sumTotal()
    );
  },
  clearTransactions() {
    this.transactionsContainer.innerHTML = "";
  },
};

const Form = {
  description: document.querySelector("#description"),
  amount: document.querySelector("#amount"),
  date: document.querySelector("#date"),
  getValues() {
    return {
      description: this.description.value,
      amount: this.amount.value,
      date: this.date.value,
    };
  },
  validateFields() {
    const { description, amount, date } = Form.getValues();
    if (
      description.trim() === "" ||
      amount.trim() === "" ||
      date.trim() === ""
    ) {
      throw new Error("Por favor, preencha todos os campos!");
    }
    console.log(Form.getValues());
  },
  formatValues() {
    let { description, amount, date } = Form.getValues();

    amount = Utils.formatAmount(amount);

    date = Utils.formatDate(date);

    return {
      description,
      amount,
      date,
    };
  },
  clearFields() {
    this.description.value = "";
    this.amount.value = "";
    this.date.value = "";
  },
  submit(event) {
    event.preventDefault();
    try {
      this.validateFields();
      const transaction = this.formatValues();
      Transaction.add(transaction);
      this.clearFields();
      Modal.close();
    } catch (error) {
      alert(error.message);
    }
  },
};

const App = {
  init() {
    Transaction.all.forEach(DOM.addTransaction, DOM);
    DOM.updateBalance();
    Storage.set(Transaction.all);
  },
  reload() {
    DOM.clearTransactions();
    App.init();
  },
};

App.init();
