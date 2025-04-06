
document.addEventListener("DOMContentLoaded", function() { 
    const categoryBudgetModal = document.getElementById("categoryBudgetModal");
    const overlay = document.getElementById("overlay");
    const newCategoryBudgetInput = document.getElementById("categoryBudgetAmount");
    const submitCategoryBtn = document.getElementById("submitBudgetBtn");
    const cancelCategoryBtn = document.getElementById("cancelBudgetBtn");

    // Close the modal and hide overlay
    cancelCategoryBtn.addEventListener("click", function() {
        categoryBudgetModal.style.display = "none";
        overlay.style.display = "none";
    });

    // Handle the submission of the new category
    submitCategoryBtn.addEventListener("click", function() {
        const newCategoryBudget = newCategoryBudgetInput.value.trim();
        if (newCategoryBudget !== "") {
            console.log("Setting category budget: ", newCategoryBudget, " for ", selectedCategoryName);
            fetch('/users/updateBudget', {
                method: 'POST',
                headers: {
                     'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    budgetAmount: newCategoryBudget,
                    categoryName: selectedCategoryName
                }),
            })
            .then(response => response.json())
            .then(data => {
                console.log(data.message);
                console.log("Full response from server:", data);
                if (data.message === 'Category updated successfully.') {
                    categoryBudgetModal.style.display = "none";
                    overlay.style.display = "none";

                    if (selectedCategoryElement) {
                        selectedCategoryElement.textContent = `$${newCategoryBudget}`;
                    }
                } else {
                    alert(data.message);
                }
            })
            .catch(err => {
                console.error(err);
                alert('An error occurred while adding the category.');
            })
        }
    });

    // Disable the submit button if the input is empty
    newCategoryBudgetInput.addEventListener("input", function() {
        if (newCategoryBudgetInput.value.trim() !== "") {
            submitCategoryBtn.disabled = false;
        } else {
            submitCategoryBtn.disabled = true;
        }
    });
});