### `Task`

Create a form with an input field where the user can enter a 6-digit Indian Postal Code. When the user submits the form, fetch the corresponding data from the API and display it on the page.
You need to create a Pincode Lookup app that uses the Indian Postal Pincode API to retrieve the details of a pincode.
The app should have an input field where the user can enter a pincode. There should also be a "Lookup" button that the user can click to fetch the details of the pincode.
When the "Lookup" button is clicked, the app should make a GET request to the API to retrieve the details of the pincode.

### The API endpoint to use is

https://api.postalpincode.in/pincode/<PINCODE>, where PINCODE is the pincode entered by the user.

The app should display the following details about the pincode:

Post office name

Pincode

District

State

`The details should be displayed in a UI as shown in the figma `-
https://www.figma.com/file/3cNCfMB8eiGezRAkt7T91s/Contest-3

### `Requirements`

The app should also allow the user to filter the results by post office name using an input field. The app should update the Ui dynamically as the user types in the filter input field.

Also handle errors accordingly- ie - if the postal code is not 6 digits then don't fetch the API rather show a message or an alert that the code is not 6 digits. Similarly if there is an error in the response, show that error on the screen. Also if the filtered Array has no object inside it after filtering even then show a message like “Couldn’t find the postal data you’re looking for…”

While the API is fetching data, please also show a loader of your choice. You can use a library for a loader or make a custom-css-loader. Show the loader till the data is fetching, once fetched don’t show the loader again. The filtering should happen real time and no loader is needed for that.

`API endpoint` - https://api.postalpincode.in/pincode/${pincode}

### `Teck Stack`

1. TailWind CSS

2. React
