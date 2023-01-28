const mysql = require('mysql');
const dotenv = require('dotenv');
dotenv.config();

const db_name = process.env.DB_NAME || '';
const db_user = process.env.DB_USERNAME || '';
const db_password = process.env.DB_PASSWORD || '';
const db_host = process.env.DB_HOST || 'localhost';

const db = mysql.createConnection({
    host: db_host,
    user: db_user,
    password: db_password,
    database: db_name
});

db.connect((err) => {
    if (err) throw err;
    console.log('Database connected');
})

// const findFirst = async (table, where, relation) => {
//     return new Promise((resolve, reject) => {
//         // jika where ada lebih dari satu maka
//         if (Object.keys(where).length > 1) {
//             // buat string kosong
//             let where_string = '';
//             // looping object where
//             for (const [key, value] of Object.entries(where)) {
//                 // jika key dan value tidak kosong
//                 if (key && value) {
//                     // jika key dan value tidak sama dengan object terakhir
//                     if (key !== Object.keys(where)[Object.keys(where).length - 1]) {
//                         // tambahkan ke string where
//                         where_string += `${key} = "${value}" AND `;
//                     } else {
//                         // tambahkan ke string where
//                         where_string += `${key} = "${value}"`;
//                     }
//                 }
//             }
//             // jika relation ada
//             if (relation) {
//                 // looping object relation
//                 for (const [key, value] of Object.entries(relation)) {
//                     // jika key dan value tidak kosong
//                     if (key && value) {
//                         // tambahkan ke string where
//                         where_string += ` AND ${key} = "${value}"`;
//                     }
//                 }
//             }
//             // query
//             db.query(`SELECT * FROM ${table} WHERE ${where_string}`, (err, result) => {
//                 if (err) reject(err);
//                 // console.log(result[0])
//                 if (result && result[0])  {
//                     resolve(result[0]);
//                 } else {
//                     resolve(null);
//                 }
//             })
//         } else {
//             // jika relation ada
//             if (relation) {
//                 // looping object relation
//                 for (const [key, value] of Object.entries(relation)) {
//                     // jika key dan value tidak kosong
//                     if (key && value) {
//                         // tambahkan ke object where
//                         where[key] = value;
//                     }
//                 }
//             }
//             // query
//             db.query(`SELECT * FROM ${table} WHERE ?`, where, (err, result) => {
//                 if (err) reject(err);
//                 // console.log(result[0])
//                 if (result && result[0])  {
//                     resolve(result[0]);
//                 } else {
//                     resolve(null);
//                 }
//             })
//         }
//     })
// }

const findFirst = async (table, where, relation) => {
    return new Promise((resolve, reject) => {
        // jika where ada lebih dari satu maka
        if (Object.keys(where).length > 1) {
            // buat string kosong
            let where_string = '';
            // looping object where
            for (const [key, value] of Object.entries(where)) {
                // jika key dan value tidak kosong
                if (key && value) {
                    // jika key dan value tidak sama dengan object terakhir
                    if (key !== Object.keys(where)[Object.keys(where).length - 1]) {
                        // tambahkan ke string where
                        where_string += `${key} = "${value}" AND `;
                    } else {
                        // tambahkan ke string where
                        where_string += `${key} = "${value}"`;
                    }
                }
            }
            // jika relation ada
            if (relation) {
                // looping object relation
                for (const [key, value] of Object.entries(relation)) {
                    // jika key dan value tidak kosong
                    if (key && value) {
                        // tambahkan ke string where
                        where_string += ` AND ${key} = "${value}"`;
                    }
                }
            }
            // query
            db.query(`SELECT * FROM ${table} WHERE ${where_string}`, (err, result) => {
                if (err) reject(err);
                // console.log(result[0])
                if (result && result[0])  {
                    resolve(result[0]);
                } else {
                    resolve(null);
                }
            })
        } else {
            // jika relation ada
            if (relation) {
                // looping object relation
                for (const [key, value] of Object.entries(relation)) {
                    // jika key dan value tidak kosong
                    if (key && value) {
                        // tambahkan ke object where
                        where[key] = value;
                    }
                }
            }
            // query
            db.query(`SELECT * FROM ${table} WHERE ?`, where, (err, result) => {
                if (err) reject(err);
                // console.log(result[0])
                if (result && result[0])  {
                    resolve(result[0]);
                } else {
                    resolve(null);
                }
            })
        }
    })
}

const findAll = async (table, where) => {
    // if (!where) then select just all
    if (!where) {
        return new Promise((resolve, reject) => {
            db.query(`SELECT * FROM ${table}`, (err, result) => {
                if (err) reject(err);
                resolve(result);
            })
        })
    } else {
        return new Promise((resolve, reject) => {
            db.query(`SELECT * FROM ${table} WHERE ?`, where, (err, result) => {
                if (err) reject(err);
                resolve(result);
            })
        })
    }

    // return new Promise((resolve, reject) => {
    //     db.query(`SELECT * FROM ${table} WHERE ?`, where, (err, result) => {
    //         if (err) reject(err);
    //         resolve(result);
    //     })
    // })
}

const create = async (table, data) => {
    return new Promise((resolve, reject) => {
        db.query(`INSERT INTO ${table} SET ?`, data, (err, result) => {
            if (err) reject(err);
            console.log(result)
            resolve(result);
        })
    })
}

const update = async (table, data, where) => {
    return new Promise((resolve, reject) => {
        db.query(`UPDATE ${table} SET ? WHERE ?`, [data, where], (err, result) => {
            if (err) reject(err);
            resolve(result);
        })
    })
}

const destroy = async (table, where) => {
    return new Promise((resolve, reject) => {
        db.query(`DELETE FROM ${table} WHERE ?`, where, (err, result) => {
            if (err) reject(err);
            resolve(result);
        })
    })
}

module.exports = {
    findFirst,
    findAll,
    create,
    update,
    destroy
}