## API Endpoints
### Post: /authenticateUser
Authenticates a user's login credentials. The server checks if the phone number exists in the database and verifies the provided password. If both match, it returns the account ID.

<u>Request:</u>  
Body `{"phone_number": "string", "password": "string"}`

<u>Result:</u>  
Successful authentication:  
Status Code `200 OK` - Body `{"message":"Password match.","account_id":1, "token":"EXAMPLE_TOKEN_GENERATED"}`  
  
Phone number does not exist in the database:  
Status Code `404 Not Found` - Body `{"error":"Account not found."}`    

Phone number found, but password does not match:  
Status Code `401 Unauthorized` - Body `{"error":"Incorrect password."}`  


