export function showLoader() {
    const loaderElement = document.getElementById('loader');
    if (loaderElement) {
        loaderElement.style.display = 'none';
    }
}

export function hideLoader() {
    document.getElementById('loader').style.display = 'none';
}

export function hideErrorMessage() {
    const errorMessageElement = document.getElementById('error-message');
    if (errorMessageElement) {
        errorMessageElement.style.display = 'none';
    }
}