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
                data.categories.forEach(category => {
                    const li = document.createElement('li');
                    li.className = 'categorySpending';

                    const wrapper = document.createElement('div');
                    wrapper.className = "categoryItem";

                    const nameSpan = document.createElement('span');
                    nameSpan.className = "categoryName";
                    nameSpan.textContent = category.name;


                    wrapper.appendChild(nameSpan);
                    li.appendChild(wrapper);

                    spendingRecommendations.appendChild(li);
                });
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