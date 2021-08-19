# microservice-template
Project template for creating microservice in docker


### Steps to run MySql inside Docker container
1. Start an interactive bash shell inside your running container   
`docker exec -it user-profile-service-db "bash"`
2. Once inside the container, connect locally with sqlcmd    
`mysql -uroot -proot`

Note: When query, always end command with `;`
