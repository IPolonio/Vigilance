import * as SQLite from 'expo-sqlite/legacy';


const db = SQLite.openDatabase('incidents.db');






export type incident = {
    id? : number;
     title: string ;
     date: string;
     description: string;
     photoUrl: string;
     audioUrl: string;
}

export const setupDatabaseAsync = async() : Promise<void> => {
    return new Promise((resolve, reject)=> {
        db.transaction(tx => {
            tx.executeSql(`CREATE TABLE IF NOT EXITS incidents(
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT,
                date TEXT,
                description TEXT,
                photoUrl TEXT,
                audioUrl TEXT);`,[],
            ()=> resolve(),
        (_,error)=>{
            reject(error);
            return true;
        })
        })
    })
}

export const insertIncidentAsync = async (
    title: string,
    date: string,
    description: string,
    photoUrl: string,
    audioUrl: string
  ): Promise<number> => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `INSERT INTO incidents (title, date, description, photoUri, audioUri) values (?, ?, ?, ?, ?)`,
          [title, date, description, photoUrl, audioUrl],
          (_, resultSet) => {
            tx.executeSql(
              `SELECT last_insert_rowid() AS id`,
              [],
              (_, { rows }) => {
                resolve(rows.item(0).id);
              },
              (_, error) => {
                reject(error);
                return true;
              }
            );
          },
          (_, error) => {
            reject(error);
            return true;
          }
        );
      });
    });
  };
  


  export const getIncidentsAsync = async (): Promise<incident[]> => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `SELECT * FROM incidents`,
          [],
          (_, { rows: { _array } }) => resolve(_array),
          (_, error) => {
            reject(error);
            return true;
          }
        );
      });
    });
  };

  export const deleteallincidentsAsync = async () : Promise<void> => {

    return new Promise((resolve, reject )=> {
        db.transaction(tx => {
            tx.executeSql(`delete from incidents`, [],
                () => resolve(),
                (_,error)=> {
                    reject(error);
                    return true;
                }
            )
        })
    })
   }