const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
let currentMonthIndex = new Date().getMonth();
let selectedCategoryName = null;


function showTab(tabId) {
    console.log("Showing tab: ", tabId);
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab=> {
        console.log("Hiding tab: ", tab.id);
        tab.classList.remove('active')
    });

    const selectedTab = document.getElementById(tabId);
    if(selectedTab) {
        console.log("Displaying tab: ", selectedTab.id);
        selectedTab.classList.add('active');
    } else {
        console.error("Tab not found: ", tabId);
    }
}


async function updateMonthlySpending(monthIndex) {
    const month = months[monthIndex];
    const data = await fetchData(`/users/profile?type=monthly&month=${month}`);

    if (data) {
        console.log(data);
        document.getElementById('selectedMonth').textContent = month;
        renderBubbleChart('#monthlySpending .bubbles-container', data.categoriesData);
    }
}

function changeMonth(direction) {
    const monthHeader = document.querySelector('#monthlySpending h2');
    if (!monthHeader) {
        console.error("Month header not found");
        return;
    }

    const currentMonthText = monthHeader.innerText.trim();
    const currentMonthName = currentMonthText.replace(/[^a-zA-Z]/g, '');

    const currentMonthIndex = months.indexOf(currentMonthName);
    if (currentMonthIndex === -1) {
        console.error("Current month not found in months array: ", currentMonthName);
        return;
    }

    let newMonthIndex = currentMonthIndex + direction;

    if (newMonthIndex < 0) newMonthIndex = 11;
    if (newMonthIndex > 11) newMonthIndex = 0;

    const newMonth = months[newMonthIndex];

    const newUrl = `/users/profile?type=monthly&month=${newMonth}`;
    history.pushState(null, "", newUrl);

    updateContent(newMonth);
}

document.getElementById('currentSpendingTab').addEventListener('click', () => {
    showTab('currentSpending');
    fetchData('/users/profile?type=current').then(response => {
        if (response) {
            console.log(response);
            response.json().then(data => {
                document.getElementById('currentMonthHeader').textContent = data.currentMonth;
                renderBubbleChart('#currentSpending .bubbles-container', data.categoriesData);
            });
        }
    });
});

document.getElementById('monthlySpendingTab').addEventListener('click', () => {
    showTab('monthlySpending');
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    updateContent(currentMonth);
});

document.getElementById('spendingHabitsTab').addEventListener('click', () => {
    showTab('spendingHabits');
    fetchData('/users/profile?type=all').then(response => {
        if (response) {
            console.log(response);
            response.json().then(data => {
                const spendingRecommendations = document.getElementById('spendingRecommendations');
                spendingRecommendations.innerHTML = '';
                
                let temp = 0;
                let tempText = "";
                let highestExpense = "";
                let tempPercent = 0;
                let total = 0;
                const currentDate = new Date();

                data.categories.forEach(category => {
                    data.categoriesData.forEach(data => {
                        if (category.name === data._id) {
                            total += data.totalSpending;
                        }
                    });
                });

                data.expenses.forEach(expense => {
                    const expenseDate = new Date(expense.date);
                    if (expenseDate.getMonth() === currentDate.getMonth() && expenseDate.getFullYear() === currentDate.getFullYear()) {
                        if (expense.amount > temp) {
                            data.categories.forEach(category => {
                                if (expense.category === category.name) {
                                    tempText = category.name;
                                }
                            });
    
                            temp = expense.amount;
                            highestExpense = expense.name;
                        }
                    } else {
                        total -= expense.amount;
                    }
                });

                tempPercent = (temp / total) * 100;

                const h3 = document.createElement("h3");
                h3.className = "recOne";
                h3.textContent = "This month, you spent the most on " + tempText + ", accounting for " + tempPercent.toFixed(2) + "% of your monthly spending. "
                if (tempPercent > 50) {
                    h3.textContent += " This is more than 50% of this month's expenses, consider evaluating this category's necessity. "
                }

                spendingRecommendations.appendChild(h3);
                spendingRecommendations.appendChild(document.createElement("br"));

                const h3_2 = document.createElement("h3");
                h3_2.className = "recTwo";
                const monthlyIncomeDifference = data.user.income.incomeAmount - total;
                let monthlyIncomePercent = 0;

                if (monthlyIncomeDifference > 0) {
                    monthlyIncomePercent = total / data.user.income.incomeAmount * 100;
                }

                if (monthlyIncomeDifference < 0) {
                    h3_2.textContent = "Based on this months spending, you spent more than your monthly income. Try lowering your spending to reach your spending goal of $" + data.user.income.savingsAmount + " in " + data.user.income.savingsDeadline + " months.";
                } else if (monthlyIncomeDifference === 0) {
                    h3_2.textContent = "Based on this months spending, you spent all of your monthly income. Try lowering your spending to reach your spending goal of $" + data.user.income.savingsAmount + " in " + data.user.income.savingsDeadline + " months.";
                } else if (total < (data.user.income.savingsAmount / data.user.income.savingsDeadline)) {
                    h3_2.textContent = "Based on this months spending, you spent " + monthlyIncomePercent.toFixed(2) + "% of your monthly income, with $" + monthlyIncomeDifference + " remaining. Try lowering your spending to reach your spending goal of $" + data.user.income.savingsAmount + " in " + data.user.income.savingsDeadline + " months.";
                } else {
                    h3_2.textContent = "Based on this months spending, you spent " + monthlyIncomePercent.toFixed(2) + "% of your monthly income, with $" + monthlyIncomeDifference + " remaining. You can still contribute to your savings goal of $" + data.user.income.savingsAmount + " in " + data.user.income.savingsDeadline + " months. Try to continue saving $" + (data.user.income.savingsAmount / data.user.income.savingsDeadline).toFixed(2) + " to achieve your goal by your desired deadline.";
                }

                spendingRecommendations.appendChild(h3_2);

                if (temp/total > 0.5) {
                    spendingRecommendations.appendChild(document.createElement("br"));

                    const h3_3 = document.createElement("h3");
                    h3_3.className = "recThree";
                    h3_3.textContent = "It looks like you have spent " + (temp/total * 100).toFixed(2) + "% of your monthly income on " + highestExpense + ". Since this purchase accounts for more than half of your spending this month, consider whether it was a one-time event or something to budget for in future months.";
                    spendingRecommendations.appendChild(h3_3);
                }

                spendingRecommendations.appendChild(document.createElement("br"));

                const h3_4 = document.createElement("h3");
                h3_4.className = "recFour";
                let lastMonthTotal = 0;
                let lastMonth = currentDate.getMonth() - 1;
                let lastMonthYear = currentDate.getFullYear();

                if (lastMonth < 0) {
                    lastMonth = 11;
                    lastMonthYear -= 1;
                }
                
                data.expenses.forEach(expense => {
                    const expenseDate = new Date(expense.date);
                    if (expenseDate.getMonth() === lastMonth && expenseDate.getFullYear() === lastMonthYear) {
                        lastMonthTotal += expense.amount;
                    }
                });

                if (lastMonthTotal > total) {
                    h3_4.textContent = "You have spent $" + (lastMonthTotal - total).toFixed(2) + " less than you did last month. Good job!";
                } else if (lastMonthTotal === total) {
                    h3_4.textContent = "You have spent the same amount as you did last month. Keep it up!";
                } else {
                    h3_4.textContent = "You have spent $" + (total - lastMonthTotal).toFixed(2) + " more than you did last month. Consider evaluating which of your expenses this month differed from last month and if they were necessary.";
                }

                spendingRecommendations.appendChild(h3_4);
            });   
        }
    });
});

document.getElementById('budgetSettingsTab').addEventListener('click', () => {
    showTab('budget');
    fetchData('/users/profile?type=budget').then(response => {
        if (response) {
            response.json().then(data => {
                const categoriesList = document.getElementById('categoriesList');
                categoriesList.innerHTML = '';
                data.categories.forEach(category => {
                    const li = document.createElement('li');
                    li.className = "categoryBudget";

                    const wrapper = document.createElement('div');
                    wrapper.className = "categoryItem";

                    const nameSpan = document.createElement('span');
                    nameSpan.className = "categoryName";
                    nameSpan.textContent = category.name;

                    const budgetSpan = document.createElement('span');
                    budgetSpan.className = "categoryBudgetAmount";
                    budgetSpan.textContent = `$${category.budget}`;

                    wrapper.appendChild(nameSpan);
                    wrapper.appendChild(budgetSpan);
                    li.appendChild(wrapper);

                    li.dataset.budget = category.budget;
                    li.dataset.name = category.name;

                    li.addEventListener('click', () => {
                        document.getElementById("categoryBudgetModal").style.display = "block";
                        document.getElementById("overlay").style.display = "block";

                        selectedCategoryName = li.dataset.name;
                        selectedCategoryElement = li.querySelector('.categoryBudgetAmount');
                    });

                    categoriesList.appendChild(li);
                });
            });
        }
    });
});

document.getElementById('settingsTab').addEventListener('click', () => {
    showTab('settings');
    fetchData('/users/profile?type=settings').then(response => {
        if (response) {
            response.json().then(data => {
                console.log(data)
            });
        }
    });
});

document.getElementById('prevMonth').addEventListener('click', () => changeMonth(-1));
document.getElementById('nextMonth').addEventListener('click', () => changeMonth(1));

async function fetchData(endpoint) {
    try {
        const response = await fetch(endpoint);
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        return response;
    } catch (err) {
        console.error("Error fetching data", err);
        return null;
    }
}

function renderBubbleChart(container, categoriesData) {
    console.log("Rendering bubble chart with container: ", container);
    const bubblesContainer = document.querySelector(container);
    if (!bubblesContainer) {
        console.error("Bubbles container not found: ", container);
        return;
    }
    bubblesContainer.innerHTML = '';

    categoriesData.forEach(category => {
        console.log("Rendering category: ", category);
        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        bubble.style.width = `${category.scaledSize}px`;
        bubble.style.height = `${category.scaledSize}px`;
        bubble.style.top = `${category.positionY}px`;
        bubble.style.left = `${category.positionX}px`;

        const categoryName = document.createElement('span');
        categoryName.className = 'category-name';
        categoryName.textContent = category._id;

        const categoryAmount = document.createElement('span');
        categoryAmount.className = 'category-amount';
        categoryAmount.textContent = `$${category.totalSpending}`;

        bubble.appendChild(categoryName);
        bubble.appendChild(categoryAmount);
        bubblesContainer.appendChild(bubble);

        console.log("Bubble created:", bubble);
    });
}

async function updateContent(month) {
    const response = await fetchData(`/users/profile?type=monthly&month=${month}`);
    if (response) {
        const data = await response.json();
        console.log("Fetched data: ", data);

        const monthHeader = document.querySelector('#monthlySpending h2');
        monthHeader.innerHTML = `
            <a id="prevMonth" style="cursor: pointer;">&lt;</a>  
            ${data.currentMonth}   
            <a id="nextMonth" style="cursor: pointer;">&gt;</a>
        `;

        const bubbleContainer = document.querySelector('#monthlySpending .bubbles-container');
        if (!bubbleContainer) {
            console.error("Bubbles container not found");
            return;
        }
        bubbleContainer.innerHTML = '';

        data.categoriesData.forEach(category => {
            const bubble = document.createElement('div');
            bubble.className = 'bubble';
            bubble.style.width = `${category.scaledSize}px`;
            bubble.style.height = `${category.scaledSize}px`;
            bubble.style.top = `${category.positionY}px`;
            bubble.style.left = `${category.positionX}px`;

            const categoryName = document.createElement('span');
            categoryName.className = 'category-name';
            categoryName.textContent = category._id;

            const categoryAmount = document.createElement('span');
            categoryAmount.className = 'category-amount';
            categoryAmount.textContent = `$${category.totalSpending}`;

            bubble.appendChild(categoryName);
            bubble.appendChild(categoryAmount);
            bubbleContainer.appendChild(bubble);
        });

        document.getElementById('prevMonth').addEventListener('click', () => changeMonth(-1));
        document.getElementById('nextMonth').addEventListener('click', () => changeMonth(1));
    }
}

showTab('currentSpending');
fetchData('/users/profile?type=current').then(data => {
    if (data) {
        document.getElementById('currentMonthHeader').textContent = data.currentMonth;
        renderBubbleChart('#currentSpending . bubbles-container', data.categoriesData);
    }
});

// Default: show overview only
showTab("none");
document.getElementById("spendingOverview").style.display = "block";

// Hide overview on tab click
const tabButtons = document.querySelectorAll('.info-rows .row');
tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        document.getElementById("spendingOverview").style.display = "none";
    });
});

// Bring back overview when clicking name
document.getElementById("overviewTrigger").addEventListener("click", () => {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove("active"));
    // Show overview
    document.getElementById("spendingOverview").style.display = "block";
});
