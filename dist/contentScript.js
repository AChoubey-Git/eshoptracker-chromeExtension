
console.log(document.getElementsByClassName("a-section a-spacing-medium a-spacing-top-small"));
let product = {
    name: "",
    id: "",
    url: "",
};
let user = {
    name: ""
}
chrome.runtime.onMessage.addListener(async(request, sender, sendResponse) => {
    const { type, productId, url } = request;
    if (url.includes("amazon.in") && type == "NEW") {
        product.name = document.getElementsByClassName("a-size-large a-spacing-none")[0].innerText;
        product.url = url;
        product.id = productId;
        const userName = document.getElementsByClassName("nav-line-1-container")[0].innerText.split(",")[1];
        user.name = userName.includes("sign") ? "Anonymous" : userName;
        sendResponse({ product, user });
    }
})