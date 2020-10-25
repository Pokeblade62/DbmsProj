//jshint esversion:6
const express = require("express");
const path = require("path");
const mysql = require("mysql");
const dotenv = require("dotenv");

const bodyParser=require("body-parser");

const ejs = require("ejs");

dotenv.config({path: './.env'});

const app = express();

app.use(bodyParser.urlencoded({extended:true}));

const db = mysql.createConnection({
host: process.env.DATABASE_HOST,
user: process.env.DATABASE_USER,
password: process.env.DATABASE_PASS,
database: process.env.DATABASE
});

const publicDirectory = path.join(__dirname,'./public');
app.use(express.static(publicDirectory));
app.set('view engine', 'ejs');
db.connect(function(err){
  if(err){
    console.log(err);
  }
  else{
    console.log("Connected to mysql :)");
  }
});


app.get("/",function(req,res){
res.render("index");
});

//Teamd Get
app.get("/Teams",function(req,res){
  db.query('SELECT * FROM team',function(err,resultt){
    console.log(resultt);

    res.render("Teams",{Allo:resultt});
  });
});

//Teams Post
app.post("/Teams",function(req,res){

const {name,location,idU,nameU,locationU,form_DateU,idD,idS} = req.body;
const{form_Date}=req.body;

db.query('SELECT name FROM team WHERE name = ?', [name],function(err,result){
  if(err){
    console.log(err);
  }
  if(result.length > 0){
    return res.redirect('/Teams?error=' + encodeURIComponent('Same_Team_Name'));
  }

  db.query('SELECT id FROM team WHERE id = (SELECT MAX(id) FROM team)',function(err,found){
     var i = found[0].id;
     db.query('INSERT INTO Team SET ?', { id:i+1, name: name, form_Date:form_Date,location:location},function(err,result){
       if(err){
         console.log(err);
       }
       else{
         res.redirect("/Teams");
       }
     });
  });
  if(idU!=null){
  db.query('UPDATE team set name=? , location =? , form_Date =? WHERE id =?',[nameU,locationU,form_DateU,idU],function(err,resu){
    if(err){
      console.log(err);
    }
    else{
      res.redirect("/Teams");
    }
  });
}
if(idD!=null){
  db.query('DELETE FROM team WHERE id =?',[idD],function(err,found){
    if(err){
      console.log(err);
    }
    else{
      res.redirect("/Teams");
    }
  });
}
if(idS!=null){
  db.query('SELECT * FROM team WHERE id =?',[idS],function(err,foundS){
    if(err){
      console.log(err);
    }
    else{
      res.render("Teams",{Allo:foundS});
    }
  });
}
});
});
//Player Get
app.get("/Player",function(req,res){
  db.query('SELECT * FROM player',function(err,result){
    db.query('SELECT name,id FROM team where id in (SELECT teamId FROM player)',function(error,rej){
      console.log(rej);
      console.log(result);
      res.render("Player",{Allo:result, Ello:rej});
    });
  });
});
//Player post
app.post("/Player",function(req,res){
const {id, F_Name, L_Name, DOB, TeamId, idU, idD, idS, F_NameU, L_NameU, DOBU, TeamIdU} = req.body;
db.query('SELECT F_name,L_name FROM player WHERE F_Name = ? and L_Name = ?', [F_Name,L_Name],function(err,result){
  if(err){
    console.log(err);
  }
  if(result.length > 0){
    return res.redirect('/Player?error=' + encodeURIComponent('Same_Player_Registered_Twice'));
  }
  if(F_Name!=null){
  db.query('SELECT id FROM team WHERE id in (SELECT id FROM team WHERE id = ?)',[TeamId],function(err,ress){
    if(err){
      console.log(err);
    }
    if(ress.length < 1){
      return res.redirect('/Player?errorFK=' + encodeURIComponent('No_Team_With_That_Id'));
    }

  db.query('SELECT id FROM player WHERE id = (SELECT MAX(id) FROM player)',function(err,found){
     var i = found[0].id;
     db.query('INSERT INTO player SET ?', { id:i+1, F_Name: F_Name, L_Name:L_Name,DOB:DOB,TeamId:TeamId},function(err,result){
       if(err){
         console.log(err);
       }
         res.redirect("/Player");
     });
     });
  });
}
  if(idU!=null){
  db.query('UPDATE player set F_Name=? , L_Name =? , DOB =?, TeamId =? WHERE id =?',[F_NameU,L_NameU,DOBU,TeamIdU,idU],function(err,resu){
    if(err){
      console.log(err);
    }
    else{
      res.redirect("/Player");
    }
  });
  }
  if(idD!=null){
  db.query('DELETE FROM player WHERE id =?',[idD],function(err,found){
    if(err){
      console.log(err);
    }
    else{
      res.redirect("/Player");
    }
  });
  }
  if(idS!=null){
  db.query('SELECT * FROM player WHERE id =?',[idS],function(err,foundS){
    db.query('SELECT name, id FROM team where id in (SELECT teamId FROM player)',function(error,rej){
      console.log(rej);
      console.log(result);
      res.render("Player",{Allo:foundS, Ello:rej});
    });
  });
  }
});
});
//Coach get
app.get("/Coach",function(req,res){
  db.query('SELECT * FROM coach',function(err,result){
    db.query('SELECT name,id FROM team where id in (SELECT teamid FROM coach)',function(error,rej){
      console.log(rej);
      console.log(result);
      res.render("Coach",{Allo:result, Ello:rej});
    });
  });
});

//Coach Post
app.post("/Coach",function(req,res){
  const {id, F_Name, L_Name, DOB, TeamId, idU, idD, idS, F_NameU, L_NameU, DOBU, TeamIdU} = req.body;
  db.query('SELECT F_name,L_name FROM coach WHERE F_Name = ? and L_Name = ?', [F_Name,L_Name],function(err,result){
    if(err){
      console.log(err);
    }
    if(F_Name!=null){
    if(result.length > 0){
      return res.redirect('/Coach?error=' + encodeURIComponent('Same_Coach_Registered_Twice'));
    }
    db.query('SELECT id FROM team WHERE id in (SELECT id FROM team WHERE id = ?)',[TeamId],function(err,ress){
      if(err){
        console.log(err);
      }
      if(ress.length < 1){
        return res.redirect('Coach?errorFK=' + encodeURIComponent('No_Team_With_That_Id'));
      }
    db.query('SELECT id FROM coach WHERE id = (SELECT MAX(id) FROM coach)',function(err,found){
       var i = found[0].id;
       db.query('INSERT INTO coach SET ?', { id:i+1, F_Name: F_Name, L_Name:L_Name,DOB:DOB,TeamId:TeamId},function(err,result){
         if(err){
           console.log(err);
         }
           res.redirect("/Coach");
       });
       });
    });
  }
    if(idU!=null){
    db.query('UPDATE coach set F_Name=? , L_Name =? , DOB =?, TeamId =? WHERE id =?',[F_NameU,L_NameU,DOBU,TeamIdU,idU],function(err,resu){
      if(err){
        console.log(err);
      }
      else{
        res.redirect("/Player");
      }
    });
    }
    if(idD!=null){
    db.query('DELETE FROM coach WHERE id =?',[idD],function(err,found){
      if(err){
        console.log(err);
      }
      else{
        res.redirect("/Player");
      }
    });
    }
    if(idS!=null){
    db.query('SELECT * FROM coach WHERE id =?',[idS],function(err,foundS){
      db.query('SELECT name, id FROM team where id in (SELECT teamId FROM coach)',function(error,rej){
        console.log(rej);
        console.log(result);
        res.render("Coach",{Allo:foundS, Ello:rej});
      });
    });
    }
  });
});
//manager GET
app.get("/Manager",function(req,res){
  db.query('SELECT * FROM manager',function(err,result){
    db.query('SELECT name,id FROM team where id in (SELECT teamid FROM manager)',function(error,rej){
      console.log(rej);
      console.log(result);
      res.render("Manager",{Allo:result, Ello:rej});
    });
  });
});
//manager post
app.post("/Manager",function(req,res){
  const {id, F_Name, L_Name, DOB, TeamId, idU, idD, idS, F_NameU, L_NameU, DOBU, TeamIdU} = req.body;
  db.query('SELECT F_name,L_name FROM manager WHERE F_Name = ? and L_Name = ?', [F_Name,L_Name],function(err,result){
    if(err){
      console.log(err);
    }
  if(F_Name!=null){
    if(result.length > 0){
      return res.redirect('/Manager?error=' + encodeURIComponent('Same_Manager_Cant_be_Registered_Twice'));
    }
    db.query('SELECT id FROM manager WHERE TeamId =?',[TeamId],function(err,resullt){
       console.log(resullt);
      if(resullt.length == 1){
        return res.redirect('/Manager?error2=' + encodeURIComponent('More_Than_One_Manager_Cant_be_Registered_For_A_Team'));
      }
    db.query('SELECT id FROM team WHERE id in (SELECT id FROM team WHERE id = ?)',[TeamId],function(err,ress){
      if(err){
        console.log(err);
      }
      if(ress.length < 1){
        return res.redirect('Manager?errorFK=' + encodeURIComponent('No_Team_With_That_Id'));
      }
    db.query('SELECT id FROM manager WHERE id = (SELECT MAX(id) FROM manager)',function(err,found){
       var i = found[0].id;
       db.query('INSERT INTO manager SET ?', { id:i+1, F_Name: F_Name, L_Name:L_Name,DOB:DOB,TeamId:TeamId},function(err,result){
         if(err){
           console.log(err);
         }
           res.redirect("/Manager");
       });
       });
    });

  });
}
});

if(idU!=null){
db.query('UPDATE manager set F_Name=? , L_Name =? , DOB =?, TeamId =? WHERE id =?',[F_NameU,L_NameU,DOBU,TeamIdU,idU],function(err,resu){
  if(err){
    console.log(err);
  }
  else{
    res.redirect("/Manager");
  }
});
}
if(idD!=null){
db.query('DELETE FROM manager WHERE id =?',[idD],function(err,found){
  if(err){
    console.log(err);
  }
  else{
    res.redirect("/Manager");
  }
});
}
if(idS!=null){
db.query('SELECT * FROM manager WHERE id =?',[idS],function(err,foundS){
  db.query('SELECT name, id FROM team where id in (SELECT teamId FROM manager)',function(error,rej){
    console.log(rej);
    res.render("Manager",{Allo:foundS, Ello:rej});
  });
});
}
});
//Tournament get
app.get("/Tournament",function(req,res){

  db.query('SELECT * from tournament',function(err,found){
if(err){
  console.log(err);
}
res.render("Tournament",{Allo:found});

  });
});
//Tournament Post
app.post("/Tournament",function(req,res){
  const {id, name, start_date, end_date, prizepool,idU, nameU, start_dateU, end_dateU, prizepoolU, idD,idS} = req.body;
  if(idU!=null){
      if(start_date > end_date){
        return res.redirect('/Tournament?errorFK=' + encodeURIComponent('StartDate>EndDate'));
      }
  db.query('UPDATE tournament set name=? , start_date =? , end_date =?, prizepool =? WHERE id =?',[nameU,start_dateU,end_dateU,prizepoolU,idU],function(err,resu){
    if(err){
      console.log(err);
    }
    else{
      res.redirect("/Tournament");
    }
  });
}
  if(idD!=null){
  db.query('DELETE FROM tournament WHERE id =?',[idD],function(err,found){
    if(err){
      console.log(err);
    }
    else{
      res.redirect("/Tournament");
    }
  });
  }
  if(idS!=null){
  db.query('SELECT * FROM tournament WHERE id =?',[idS],function(err,foundS){
    res.render("Tournament",{Allo:foundS});
  });
  }
  if(name!=null){
  db.query('SELECT name FROM tournament WHERE name = ?', [name],function(err,result){
    if(err){
      console.log(err);
    }
    if(result.length > 0){
      return res.redirect('/Tournament?error=' + encodeURIComponent('Same_Tournament_Registered_Twice'));
    }
    db.query("SELECT id FROM tournament where start_date= ?",[start_date],function(err,foundd){
      if(err){
        console.log(err);
      }
        if(foundd.length>0){
          console.log(foundd);
          return res.redirect('/Tournament?error1=' + encodeURIComponent('2_Tournament_In_1_Day'));
        }

          if(start_date > end_date){
            return res.redirect('/Tournament?errorFK=' + encodeURIComponent('StartDate>EndDate'));
          }

var i;
    db.query('SELECT id FROM tournament WHERE id = (SELECT MAX(id) FROM tournament)',function(err,found){
      if(found.length==0){
        i = 1;
      }
      else{
       i = found[0].id;
     }
       db.query('INSERT INTO tournament SET ?', { id:i+1, start_date:start_date,end_date:end_date,name: name,prizepool:prizepool},function(err,result){
         if(err){
           console.log(err);
         }
           res.redirect("/Tournament");
       });
        });

       });
  });
}
});
//Match get
app.get("/Match",function(req,res){
  const poiu = req.body;
  console.log(poiu);
  db.query('SELECT * from matches',function(err,found){
    db.query('SELECT * from matchdet',function(err,fnd){
if(err){
  console.log(err);
}
res.render("Match",{Allo:found,xd:fnd});
  });
  });
});
//match post
app.post("/Match",function(req,res){
  const {id, hometeam, awayteam, tournamentid, date,hometeamU,awayteamU,tournamentidU,dateU,idU,idD,idS} = req.body;
  if(idU!=null){
    db.query('SELECT id FROM matches WHERE id = (SELECT MAX(id) FROM matches)',function(err,found){
      db.query('select id from tournament where id = ?',[tournamentidU],function(err,fnd){
        if(err){
            console.log(err);
         }
        if(fnd.length==0){
          return res.redirect('/Match?error=' + encodeURIComponent('No_Tournament_With_that_id'));
        }
        db.query('SELECT id from team where id in(?,?)',[hometeamU,awayteamU],function(err,fnnd){
          if(err){
            console.log(err);
          }
          if(fnnd.length<2){
            return res.redirect('/Match?error1=' + encodeURIComponent('no_team_with_that_id'));
          }
          db.query('SELECT id FROM tournament WHERE start_date < ? AND end_date > ? ',[dateU,dateU],function(err,fnf){
            if(err){
              console.log(err);
            }
            if(fnf.length==0){
              return res.redirect('/Match?errorFK=' + encodeURIComponent('out_of_range'));
            }
  db.query('UPDATE matches set hometeam=? , awayteam =? , tournamentid =?, date =? WHERE id =?',[hometeamU,awayteamU,tournamentidU,dateU,idU],function(err,resu){
    if(err){
      console.log(err);
    }
    else{
      res.redirect("/Match");
    }
  });
});
});
});
});
}
  if(idD!=null){
  db.query('DELETE FROM matches WHERE id =?',[idD],function(err,found){
    if(err){
      console.log(err);
    }
    else{
      res.redirect("/Match");
    }
  });
  }
  if(idS!=null){
  db.query('SELECT * FROM matches WHERE id =?',[idS],function(err,foundS){
    res.render("Match",{Allo:foundS});
  });
  }
  if(hometeam!=null){
    db.query('SELECT id FROM matches WHERE id = (SELECT MAX(id) FROM matches)',function(err,found){
      db.query('select id from tournament where id = ?',[tournamentid],function(err,fnd){
        if(err){
            console.log(err);
         }
        if(fnd.length==0){
          return res.redirect('/Match?error=' + encodeURIComponent('No_Tournament_With_that_id'));
        }
        db.query('SELECT id from team where id in(?,?)',[hometeam,awayteam],function(err,fnnd){
          if(err){
            console.log(err);
          }
          if(fnnd.length<2){
            return res.redirect('/Match?error1=' + encodeURIComponent('no_team_with_that_id'));
          }
          db.query('SELECT id FROM tournament WHERE start_date < ? AND end_date > ? ',[date,date],function(err,fnf){
            if(err){
              console.log(err);
            }
            if(fnf.length==0){
              return res.redirect('/Match?errorFK=' + encodeURIComponent('out_of_range'));
            }

      if(found.length==0){
        i = 0;
      }
      else{
       i = found[0].id;
     }
       db.query('INSERT INTO matches SET ?', { id:i+1, hometeam:hometeam,awayteam:awayteam,tournamentid: tournamentid,date:date},function(err,result){
         if(err){
           console.log(err);
         }
           res.redirect("/Match");
       });
         });
      });
         });
        });
      }
});
//MatchDet get
app.get("/MatchDet",function(req,res){

  db.query('SELECT * from matchdet',function(err,found){
    db.query('SELECT id from matches',function(err,rnd){
      var i;
  for(i=0; i<rnd.length; i++){
    if(!found[i]){
    db.query('INSERT INTO matchdet set ?',{id:rnd[i].id});
    return res.redirect('/MatchDet');
  }
}
if(err){
  console.log(err);
}
res.render("MatchDet",{Allo:found});
  });
    });
});
//MatchDetPost
app.post("/MatchDet",function(req,res){
  const {id, winner, hometeamgoal, awayteamgoal, hometeamgoalU, winnerU, awayteamgoalU, idU, idD,idS} = req.body;
  if(idU!=null){

  db.query('UPDATE matchdet set winner=? , hometeamgoal =? , awayteamgoal =? WHERE id =?',[winnerU,hometeamgoalU,awayteamgoalU,idU],function(err,resu){
    if(err){
      console.log(err);
    }
    else{
      res.redirect("/MatchDet");
    }
  });
}
  if(idD!=null){
  db.query('DELETE FROM matchdet WHERE id =?',[idD],function(err,found){
    if(err){
      console.log(err);
    }
    else{
      res.redirect("/MatchDet");
    }
  });
  }
  if(idS!=null){
  db.query('SELECT * FROM matches WHERE id =?',[idS],function(err,foundS){
    res.render("MatchDet",{Allo:foundS});
  });
  }
});

//contact get
app.get("/Contact",function(req,res){
  db.query('SELECT * from playercontact',function(err,fnd){
    db.query('SELECT * from coachcontact',function(err,fnnd){
      db.query('SELECT * from managercontact',function(err,fnnnd){
              res.render("Contact",{Allo:fnd,Ello:fnnd,Illo:fnnnd});
      });
    });
  });
});
// contact post
app.post('/Contact',function(req,res){
const{idpla,phonepla,idplaU,phoneplaU,idplaD,phoneplaD,idplaS,idcoa,phonecoa,idcoaU,phonecoaU,idcoaD,phonecoaD,idcoaS,idman,phoneman,idmanU,phonemanU,idmanD,phonemanD,idmanS}=req.body;
  console.log(idcoaD,phonecoaD);
if(idpla!=null){
  db.query('INSERT INTO playercontact SET ?', { id:idpla, phone:phonepla},function(err,result){
  });
  res.redirect("/Contact");
}
if(idplaU!=null){
  db.query('UPDATE playercontact SET phone=? where id=?',[phoneplaU,idplaU],function(err,res){
    if(err){
      console.log(err);
    }
  });
  res.redirect("/Contact");
}
if(idplaD!=null){
  db.query('DELETE FROM playercontact WHERE id=? and phone=?',[idplaD,phoneplaD],function(err,res){
  });
  res.redirect("/Contact");
}
if(idplaS!=null){
  db.query('SELECT * FROM playercontact WHERE id=?',[idplaS],function(err,fnd){
    db.query('SELECT * from coachcontact',function(err,fnnd){
      db.query('SELECT * from managercontact',function(err,fnnnd){
              res.render("Contact",{Allo:fnd,Ello:fnnd,Illo:fnnnd});
      });
    });
  });
}
if(idcoa!=null){
  db.query('INSERT INTO coachcontact SET ?', { id:idcoa, phone:phonecoa},function(err,result){
    if(err){
      console.log(err);

    }
  });
  res.redirect("/Contact");
}
if(idcoaU!=null){
  db.query('UPDATE coachcontact SET phone=? where id=?',[phonecoaU,idcoaU],function(err,res){
    if(err){
      console.log(err);
    }
  });
  res.redirect("/Contact");
}
if(idcoaD!=null){
  db.query('DELETE FROM coachcontact WHERE id=? and phone=?',[idcoaD,phonecoaD],function(err,res){
  });
  res.redirect("/Contact");
}
if(idcoaS!=null){
  db.query('SELECT * FROM playercontact',function(err,fnd){
    db.query('SELECT * from coachcontact WHERE id=?',[idcoaS],function(err,fnnd){
      db.query('SELECT * from managercontact',function(err,fnnnd){
              res.render("Contact",{Allo:fnd,Ello:fnnd,Illo:fnnnd});
      });
    });
  });
}
if(idman!=null){
  db.query('INSERT INTO managercontact SET ?', { id:idman, phone:phoneman},function(err,result){
  });
  res.redirect("/Contact");
}
if(idmanU!=null){
  db.query('UPDATE managercontact SET phone=? where id=?',[phonemanU,idmanU],function(err,res){
    if(err){
      console.log(err);
    }
  });
  res.redirect("/Contact");
}
if(idmanD!=null){
  db.query('DELETE FROM managercontact WHERE id=? and phone=?',[idmanD,phonemanD],function(err,res){
  });
  res.redirect("/Contact");
}
if(idmanS!=null){
  db.query('SELECT * FROM playercontact',function(err,fnd){
    db.query('SELECT * from coachcontact',function(err,fnnd){
      db.query('SELECT * from managercontact WHERE id=?',[idmanS],function(err,fnnnd){
              res.render("Contact",{Allo:fnd,Ello:fnnd,Illo:fnnnd});
      });
    });
  });
}
});
//Stadium get
app.get("/Stadium",function(req,res){
  db.query('SELECT * FROM stadium',function(err,result){
    db.query('SELECT name,id FROM team where id in (SELECT ownedby FROM stadium)',function(error,rej){
      console.log(rej);
      console.log(result);
      res.render("Stadium",{Allo:result, Ello:rej});
    });
  });
});
//Stadium post
app.post("/Stadium",function(req,res){
  const {id, name, location,  ownedby, idU, idD, idS, nameU, locationU, ownedbyU} = req.body;
  if(name!=null){
    if(result.length > 0){
      return res.redirect('/Manager?error=' + encodeURIComponent('Same_Manager_Cant_be_Registered_Twice'));
    }
    db.query('SELECT id FROM WHERE TeamId =?',[TeamId],function(err,resullt){
       console.log(resullt);
      if(resullt.length == 1){
        return res.redirect('/Manager?error2=' + encodeURIComponent('More_Than_One_Manager_Cant_be_Registered_For_A_Team'));
      }
    db.query('SELECT id FROM team WHERE id in (SELECT id FROM team WHERE id = ?)',[TeamId],function(err,ress){
      if(err){
        console.log(err);
      }
      if(ress.length < 1){
        return res.redirect('Manager?errorFK=' + encodeURIComponent('No_Team_With_That_Id'));
      }
    db.query('SELECT id FROM manager WHERE id = (SELECT MAX(id) FROM manager)',function(err,found){
       var i = found[0].id;
       db.query('INSERT INTO manager SET ?', { id:i+1, F_Name: F_Name, L_Name:L_Name,DOB:DOB,TeamId:TeamId},function(err,result){
         if(err){
           console.log(err);
         }
           res.redirect("/Manager");
       });
       });
    });

  });
}
if(idU!=null){
db.query('UPDATE manager set F_Name=? , L_Name =? , DOB =?, TeamId =? WHERE id =?',[F_NameU,L_NameU,DOBU,TeamIdU,idU],function(err,resu){
  if(err){
    console.log(err);
  }
  else{
    res.redirect("/Manager");
  }
});
}
if(idD!=null){
db.query('DELETE FROM manager WHERE id =?',[idD],function(err,found){
  if(err){
    console.log(err);
  }
  else{
    res.redirect("/Manager");
  }
});
}
if(idS!=null){
db.query('SELECT * FROM manager WHERE id =?',[idS],function(err,foundS){
  db.query('SELECT name, id FROM team where id in (SELECT teamId FROM manager)',function(error,rej){
    console.log(rej);
    res.render("Manager",{Allo:foundS, Ello:rej});
  });
});
}
});



app.listen(3000, function(){
  console.log("listening on 3000");
});
