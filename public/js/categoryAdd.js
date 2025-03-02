document.addEventListener("DOMContentLoaded", function() {
    const addCategoryBtn = document.getElementById("addCategoryBtn");
    const addCategoryModal = document.getElementById("addCategoryModal");
    const overlay = document.getElementById("overlay");
    const newCategoryNameInput = document.getElementById("newCategoryName");
    const submitCategoryBtn = document.getElementById("submitCategoryBtn");
    const cancelCategoryBtn = document.getElementById("cancelCategoryBtn");

    // Show the modal and overlay when the "+" button is clicked
    addCategoryBtn.addEventListener("click", function() {
        addCategoryModal.style.display = "block";
        overlay.style.display = "block";
    });

    // Close the modal and hide overlay
    cancelCategoryBtn.addEventListener("click", function() {
        addCategoryModal.style.display = "none";
        overlay.style.display = "none";
    });

    // Handle the submission of the new category
    submitCategoryBtn.addEventListener("click", function() {
        const newCategoryName = newCategoryNameInput.value.trim();
        if (newCategoryName !== "") {
            console.log("Sending category:", newCategoryName);
            fetch('/users/addCategory', {
                method: 'POST',
                headers: {
                     'Content-Type': 'application/json',
                },
                body: JSON.stringify({ categoryName: newCategoryName }),
            })
            .then(response => response.json())
            .then(data => {
                console.log(data.message);
                if (data.message === 'Category added successfully.') {
                    // Add the new category to the list dynamically
                    const newCategoryItem = document.createElement("li");
                    newCategoryItem.textContent = newCategoryName;
                    document.querySelector("#settings ul").appendChild(newCategoryItem);
    
                    // Close the modal and hide overlay
                    addCategoryModal.style.display = "none";
                    overlay.style.display = "none";
                } else {
                    alert(data.message);  // Show error message
                }
            })
            .catch(err => {
                console.error(err);
                alert('An error occurred while adding the category.');
            })
        }
    });

    // Disable the submit button if the input is empty
    newCategoryNameInput.addEventListener("input", function() {
        if (newCategoryNameInput.value.trim() !== "") {
            submitCategoryBtn.disabled = false;
        } else {
            submitCategoryBtn.disabled = true;
        }
    });
});