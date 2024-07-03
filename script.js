// script.js
navigator.serviceWorker.register('/service-worker.js')
.then((registration) => {
    console.log('Service Worker registrado com sucesso:', registration);
})
.catch((error) => {
    console.log('Falha ao registrar o Service Worker:', error);
});

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('expense-form');
    const list = document.getElementById('list');
    const totalSource = document.getElementById('total-source');
    const totalDestination = document.getElementById('total-destination');
    let expenses = [];

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const description = document.getElementById('description').value;
        const quantity = Number(document.getElementById('quantity').value);
        const unitValue = Number(document.getElementById('unit-value').value);
        const sourceCurrency = document.getElementById('source-currency').value;
        const destinationCurrency = document.getElementById('destination-currency').value;

        const exchangeRate = await getExchangeRate(destinationCurrency, sourceCurrency);
        const totalValueInSourceCurrency = unitValue * quantity * exchangeRate;

        const expense = {
            description,
            quantity,
            unitValue,
            sourceCurrency,
            destinationCurrency,
            totalValueInSourceCurrency,
            totalValueInDestinationCurrency: unitValue * quantity,
        };

        expenses.push(expense);
        updateList();
        updateTotals();
        form.reset();
    });

    async function getExchangeRate(destCurrency, srcCurrency) {
        const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${destCurrency}`);
        const data = await response.json();
        return data.rates[srcCurrency];
    }

    function updateList() {
        list.innerHTML = '';
        expenses.forEach((expense, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${expense.description} - ${expense.quantity} x ${expense.unitValue.toFixed(2)} ${expense.destinationCurrency} = ${expense.totalValueInDestinationCurrency.toFixed(2)} ${expense.destinationCurrency} (${expense.totalValueInSourceCurrency.toFixed(2)} ${expense.sourceCurrency})</span>
                <button onclick="editExpense(${index})"><i class="fas fa-pencil-alt"></i></button>
                <button onclick="deleteExpense(${index})"><i class="fas fa-trash-alt"></i></button>
            `;
            list.appendChild(li);
        });
    }

    function updateTotals() {
        const totalInSource = expenses.reduce((sum, expense) => sum + expense.totalValueInSourceCurrency, 0);
        const totalInDestination = expenses.reduce((sum, expense) => sum + expense.totalValueInDestinationCurrency, 0);
        totalSource.textContent = `Total na moeda de origem: ${totalInSource.toFixed(2)}`;
        totalDestination.textContent = `Total na moeda de destino: ${totalInDestination.toFixed(2)}`;
    }

    window.editExpense = (index) => {
        const expense = expenses[index];
        document.getElementById('description').value = expense.description;
        document.getElementById('quantity').value = expense.quantity;
        document.getElementById('unit-value').value = expense.unitValue;
        document.getElementById('source-currency').value = expense.sourceCurrency;
        document.getElementById('destination-currency').value = expense.destinationCurrency;

        expenses.splice(index, 1);
        updateList();
        updateTotals();
    };

    window.deleteExpense = (index) => {
        expenses.splice(index, 1);
        updateList();
        updateTotals();
    };
});
