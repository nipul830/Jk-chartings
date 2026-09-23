// Jk Chartings <-> Demo Broker bridge for MetaTrader 5
#property strict
#property version "1.0"
#include <Trade/Trade.mqh>
CTrade trade;

input string ApiBaseUrl = "https://YOUR-BROKER-API.example.com";
input string AccountId = "demo-10001";
input string ApiKey = "";
input int PollSeconds = 2;
input double DefaultLot = 0.01;

string Url(string path){ return ApiBaseUrl + path; }

bool HttpGet(string path,string &response){
 char data[],result[]; string headers;
 string h="Accept: application/json\r\nX-API-Key: "+ApiKey+"\r\nX-Account-Id: "+AccountId+"\r\n";
 ResetLastError();
 int code=WebRequest("GET",Url(path),h,5000,data,result,headers);
 if(code<200 || code>=300){Print("JkChartings GET HTTP=",code," err=",GetLastError());return false;}
 response=CharArrayToString(result); return true;
}

bool HttpPost(string path,string body,string &response){
 char data[],result[]; string headers;
 StringToCharArray(body,data,0,WHOLE_ARRAY,CP_UTF8);
 string h="Content-Type: application/json\r\nAccept: application/json\r\nX-API-Key: "+ApiKey+"\r\nX-Account-Id: "+AccountId+"\r\n";
 ResetLastError();
 int code=WebRequest("POST",Url(path),h,5000,data,result,headers);
 if(code<200 || code>=300){Print("JkChartings POST HTTP=",code," err=",GetLastError());return false;}
 response=CharArrayToString(result); return true;
}

void ReportState(){
 double balance=AccountInfoDouble(ACCOUNT_BALANCE);
 double equity=AccountInfoDouble(ACCOUNT_EQUITY);
 string positions="["; bool first=true;
 for(int i=0;i<PositionsTotal();i++){
   ulong ticket=PositionGetTicket(i); if(ticket==0) continue;
   string symbol=PositionGetString(POSITION_SYMBOL);
   double volume=PositionGetDouble(POSITION_VOLUME);
   double profit=PositionGetDouble(POSITION_PROFIT);
   long type=PositionGetInteger(POSITION_TYPE);
   if(!first) positions+=",";
   first=false;
   positions+=StringFormat("{\"ticket\":\"%I64u\",\"symbol\":\"%s\",\"side\":\"%s\",\"volume\":%.4f,\"profit\":%.2f}",ticket,symbol,type==POSITION_TYPE_BUY?"BUY":"SELL",volume,profit);
 }
 positions+="]";
 string body=StringFormat("{\"accountId\":\"%s\",\"balance\":%.2f,\"equity\":%.2f,\"positions\":%s}",AccountId,balance,equity,positions);
 string response; HttpPost("/mt5/state",body,response);
}

void ProcessCommands(){
 string response;
 if(!HttpGet("/mt5/commands?accountId="+AccountId,response)) return;
 int p=StringFind(response,"\"commands\":["); if(p<0) return;

 int idp=StringFind(response,"\"id\":\"",p);
 int ids=idp+6; int ide=StringFind(response,"\"",ids);
 string commandId=idp>=0?StringSubstr(response,ids,ide-ids):"";

 int sp=StringFind(response,"\"symbol\":\"",p);
 int ss=sp+10; int se=StringFind(response,"\"",ss);
 string symbol=sp>=0?StringSubstr(response,ss,se-ss):"";

 int sidep=StringFind(response,"\"side\":\"",p);
 int sides=sidep+8; int sidee=StringFind(response,"\"",sides);
 string side=sidep>=0?StringSubstr(response,sides,sidee-sides):"";

 int vp=StringFind(response,"\"volume\":",p);
 int vs=vp+9; int ve=StringFind(response,",",vs);
 if(ve<0) ve=StringFind(response,"}",vs);
 double volume=vp>=0?StringToDouble(StringSubstr(response,vs,ve-vs)):DefaultLot;

 if(symbol=="") return;
 SymbolSelect(symbol,true);
 trade.SetDeviationInPoints(20);
 bool ok=false;
 if(side=="BUY") ok=trade.Buy(volume,symbol);
 else if(side=="SELL") ok=trade.Sell(volume,symbol);

 string result=StringFormat("{\"commandId\":\"%s\",\"ok\":%s,\"retcode\":%d,\"ticket\":%I64u}",commandId,ok?"true":"false",(int)trade.ResultRetcode(),trade.ResultOrder());
 string ignored; HttpPost("/mt5/command-result",result,ignored);
}

int OnInit(){ EventSetTimer(MathMax(1,PollSeconds)); Print("Jk Chartings MT5 bridge started: ",AccountId); return INIT_SUCCEEDED; }
void OnDeinit(const int reason){ EventKillTimer(); }
void OnTimer(){ ProcessCommands(); ReportState(); }
