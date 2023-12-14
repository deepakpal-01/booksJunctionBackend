const neo4j=require('neo4j-driver')

require('dotenv').config()

const status=false;

const uri=process.env.NEO4J_URI
const user=process.env.NEO4J_USERNAME
const password=process.env.NEO4J_PASSWORD

const driver = neo4j.driver(uri, neo4j.auth.basic(user, password))
const session = driver.session({user})

const getAllBooks=async(user)=>{
    try {
        const id=user.id.split(':')[2]
        const result =await driver.executeQuery(`
        MATCH(N:User) WHERE id(N)=${id}
        MATCH(N:User)-[:HAS]->(Book)   
        RETURN Book
        `)
        const tempresponse=result.records.map(i=>i.get('Book').properties)
        const ids=result.records.map(i=>i.get('Book').elementId.split(':')[2])
        const response=tempresponse.map((book,index)=>{
            return {...book,bookid:ids[index]}
        })
        return {response,status:true}
    } catch (error) {
        return {status:status,error}
    }
}

const addBook=async(user,book)=>{
    try {
        const id=user.id.split(':')[2]
    
    const result=await driver.executeQuery(`
    MATCH(N:User) WHERE id(N)=${id}
    CREATE (B:Book {title:'${book.title}',description:'${book.description}',category:'${book.category}',price:'${book.price}',discount:'${book.discount}',userid:'${book.userid}'})
    CREATE (N)-[:HAS]->(B) RETURN B`)
    
    
    const tempresponse=result.records[0].get('B').properties
    const bookId=result.records[0].get('B').elementId.split(':')[2]

    const response={...tempresponse,bookid:bookId}
    return {response,status:true}

    } catch (error) {
        return {status,error}
    }
    
}

const editBook=async(userid,bookid,updatedBook)=>{
    try {
    const result=await driver.executeQuery(`
    MATCH(B:Book) WHERE id(B)=${bookid} AND B.userid='${userid}'
    SET B.title='${updatedBook.title}',B.description='${updatedBook.description}',B.category='${updatedBook.category}',B.price='${updatedBook.price}',B.discount='${updatedBook.discount}'
    RETURN B`)
    const response=result.records[0].get('B').properties
    return {response,status:true}
    } catch (error) {
        return {status,error}
    }
}

const deleteBook=async(userid,bookid)=>{
    try {
        const result=await driver.executeQuery(`
    MATCH(B:Book) WHERE id(B)=${bookid} AND B.userid='${userid}' DETACH DELETE(B)`)

    return {status:true}
    } catch (error) {
        return {status,error}
    }
}

module.exports={getAllBooks,addBook,editBook,deleteBook}