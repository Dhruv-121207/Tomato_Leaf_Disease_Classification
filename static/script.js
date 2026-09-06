const imageInput =
    document.getElementById("imageInput");

const dropArea =
    document.getElementById("dropArea");

const previewSection =
    document.getElementById("previewSection");

const previewImage =
    document.getElementById("previewImage");

const removeImage =
    document.getElementById("removeImage");

const analyzeButton =
    document.getElementById("analyzeButton");

const loadingSection =
    document.getElementById("loadingSection");

const resultCard =
    document.getElementById("resultCard");

const predictionText =
    document.getElementById("predictionText");

const confidenceText =
    document.getElementById("confidenceText");

const confidenceValue =
    document.getElementById("confidenceValue");

const errorBox =
    document.getElementById("errorBox");

const modelSidebar =
    document.getElementById("modelSidebar");

const openSidebar =
    document.getElementById("openSidebar");

const closeSidebar =
    document.getElementById("closeSidebar");

const overlay =
    document.getElementById("overlay");


let selectedFile = null;


function openModelSidebar() {

    modelSidebar.classList.add("open");

    overlay.classList.add("show");

    document.body.classList.add("sidebar-open");
}


function closeModelSidebar() {

    modelSidebar.classList.remove("open");

    overlay.classList.remove("show");

    document.body.classList.remove("sidebar-open");
}


openSidebar.addEventListener(
    "click",
    openModelSidebar
);


closeSidebar.addEventListener(
    "click",
    closeModelSidebar
);


overlay.addEventListener(
    "click",
    closeModelSidebar
);


document.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Escape") {
            closeModelSidebar();
        }
    }
);


function showImage(file) {

    if (!file) {
        return;
    }


    if (
        file.type !== "image/jpeg" &&
        file.type !== "image/png"
    ) {

        showError(
            "Please select a JPG or PNG image."
        );

        return;
    }


    selectedFile = file;


    const imageURL =
        URL.createObjectURL(file);


    previewImage.src = imageURL;

    previewSection.style.display =
        "block";


    resultCard.style.display =
        "none";


    errorBox.style.display =
        "none";
}


imageInput.addEventListener(
    "change",
    function () {

        const file =
            imageInput.files[0];

        showImage(file);
    }
);


dropArea.addEventListener(
    "dragover",
    function (event) {

        event.preventDefault();

        dropArea.classList.add(
            "dragging"
        );
    }
);


dropArea.addEventListener(
    "dragleave",
    function () {

        dropArea.classList.remove(
            "dragging"
        );
    }
);


dropArea.addEventListener(
    "drop",
    function (event) {

        event.preventDefault();

        dropArea.classList.remove(
            "dragging"
        );


        const file =
            event.dataTransfer.files[0];


        showImage(file);
    }
);


removeImage.addEventListener(
    "click",
    function () {

        selectedFile = null;

        imageInput.value = "";

        previewImage.src = "";

        previewSection.style.display =
            "none";

        resultCard.style.display =
            "none";

        errorBox.style.display =
            "none";
    }
);


function formatDiseaseName(name) {

    return name
        .replaceAll("_", " ")
        .replace(/\s+/g, " ")
        .trim();
}


function showError(message) {

    errorBox.innerText =
        message;

    errorBox.style.display =
        "block";

    resultCard.style.display =
        "none";
}


analyzeButton.addEventListener(
    "click",
    async function () {

        if (!selectedFile) {

            showError(
                "Please upload a tomato leaf image first."
            );

            return;
        }


        errorBox.style.display =
            "none";


        loadingSection.style.display =
            "flex";


        analyzeButton.disabled =
            true;


        resultCard.style.display =
            "none";


        const formData =
            new FormData();


        formData.append(
            "file",
            selectedFile
        );


        try {

            const response =
                await fetch(
                    "/predict",
                    {
                        method: "POST",
                        body: formData
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.detail ||
                    "Unable to analyze the image."
                );
            }


            const diseaseName =
                formatDiseaseName(
                    data.prediction
                );


            const confidence =
                data.confidence * 100;


            predictionText.innerText =
                diseaseName;


            confidenceText.innerText =
                `${confidence.toFixed(2)}%`;


            confidenceValue.style.width =
                `${confidence}%`;


            resultCard.style.display =
                "block";


            resultCard.scrollIntoView({
                behavior: "smooth",
                block: "nearest"
            });

        }

        catch (error) {

            showError(
                error.message
            );
        }

        finally {

            loadingSection.style.display =
                "none";


            analyzeButton.disabled =
                false;
        }
    }
);