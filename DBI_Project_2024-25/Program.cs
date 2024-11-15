using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using DBI_Project_2024_25.Models;
using DBI_Project_2024_25;

var sqliteBuilder = WebApplication.CreateSlimBuilder(args);
//var noSqlBuilder = WebApplication.CreateSlimBuilder(args);

var sqliteApp = SqliteProgram.GenerateApp(sqliteBuilder);
// var noSqlApp = NoSqlProgramm.GenerateApp(builder);

sqliteApp.Run();

[JsonSerializable(typeof(Tier))]
[JsonSerializable(typeof(List<Tier>))]
[JsonSerializable(typeof(Filiale))]
[JsonSerializable(typeof(List<Filiale>))]
[JsonSerializable(typeof(TierFiliale))]
[JsonSerializable(typeof(List<TierFiliale>))]
[JsonSerializable(typeof(SeedingRequest))]
internal partial class AppJsonSerializerContext : JsonSerializerContext {}