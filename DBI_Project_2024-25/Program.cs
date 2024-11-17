using System.Collections.Generic;
using System.Diagnostics;
using System.Text.Json.Serialization;
using Bogus.Extensions.UnitedKingdom;
using DBI_Project_2024_25.Infrastructure;
using DBI_Project_2024_25.Models;
using DBI_Project_2024_25.Models.MongoModels;
using Microsoft.AspNetCore.Routing.Constraints;
using Microsoft.EntityFrameworkCore;
using MongoDB.Driver;

var builder = WebApplication.CreateSlimBuilder(args);
builder.Services.AddDbContext<TierDbContext>(options =>
{
    if (builder.Environment.IsDevelopment()) options.EnableSensitiveDataLogging();
    options.UseSqlite(builder.Configuration.GetConnectionString("Sqlite"));
});

var client = new MongoClient(builder.Configuration.GetConnectionString("MongoDB"));
var mongoDatabase = client.GetDatabase("dbi_project_2024-25");

builder.Services.AddDbContext<MongoTierDbContext>(options => {
    if (builder.Environment.IsDevelopment()) options.EnableSensitiveDataLogging();
    options.UseMongoDB(mongoDatabase.Client, mongoDatabase.DatabaseNamespace.DatabaseName);
});

builder.Services.Configure<RouteOptions>(
    options => options.SetParameterPolicy<RegexInlineRouteConstraint>("regex"));

builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.TypeInfoResolverChain.Insert(0, AppJsonSerializerContext.Default);
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add Seeding Service
builder.Services.AddScoped<SeedingService>();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<TierDbContext>();
    var mongoDb = scope.ServiceProvider.GetRequiredService<MongoTierDbContext>();

    db.Database.EnsureDeleted();
    db.Database.EnsureCreated();

    mongoDb.Database.AutoTransactionBehavior = AutoTransactionBehavior.Never;
    mongoDb.Database.EnsureCreated();
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

Stopwatch stopwatch = new();

// GET Tiere
app.MapGet("/tiere", (TierDbContext db) => {
    stopwatch.Start();
    var list = db.Tiere.ToList();
    stopwatch.Stop();

    return new TimedResult<List<Tier>>(list, stopwatch.Elapsed).IntoOkResult();
});

app.MapGet("/tier/{name}", (string name, TierDbContext db) =>
{
    stopwatch.Start();
    var tier = db.Tiere.Find(name);
    stopwatch.Stop();
    if (tier is null) {
        return Results.NotFound();
    }

    return new TimedResult<Tier>(tier, stopwatch.Elapsed).IntoOkResult();
});

app.MapGet("/tiere/filiale/{id}", (int id, TierDbContext db) =>
{
    stopwatch.Start();
    var tiere = db.TierFilialen
        .Where(tf => tf.FilialeId == id)
        .Join(db.Tiere, tf => tf.TierName, t => t.Name, (tf, t) => t)
        .ToList();
    stopwatch.Stop();

    return new TimedResult<List<Tier>>(tiere, stopwatch.Elapsed).IntoOkResult();
});

// GET Filialen
app.MapGet("/filialen", (TierDbContext db) => {
    stopwatch.Start();
    var filialen = db.Filialen.ToList();
    stopwatch.Stop();

   return new TimedResult<List<Filiale>>(filialen, stopwatch.Elapsed).IntoOkResult();
});

app.MapGet("/filiale/{id}", (int id, TierDbContext db) =>
{
    stopwatch.Start();
    var filiale = db.Filialen.Find(id);
    stopwatch.Stop();

    if (filiale is null) {
        return Results.NotFound();
    }

    return new TimedResult<Filiale>(filiale, stopwatch.Elapsed).IntoOkResult();
});

app.MapGet("/filialen/tier/{name}", (string name, TierDbContext db) =>
{
    stopwatch.Start();
    var filialen = db.TierFilialen
        .Where(tf => tf.TierName == name)
        .Join(db.Filialen, tf => tf.FilialeId, f => f.Id, (tf, f) => f)
        .ToList();
    stopwatch.Stop();

    return new TimedResult<List<Filiale>>(filialen, stopwatch.Elapsed).IntoOkResult();
});

// GET all TierFilialen
app.MapGet("/tierfilialen", (TierDbContext db) => {
    stopwatch.Start();
    var tierFilialen = db.TierFilialen.ToList();
    stopwatch.Stop();

    return new TimedResult<List<TierFiliale>>(tierFilialen, stopwatch.Elapsed).IntoOkResult();
});

app.MapGet("/tierfilialen/tier/{name}", (string name, TierDbContext db) =>
{
    stopwatch.Start();
    var tierFilialen = db.TierFilialen.Where(tf => tf.TierName == name).ToList();
    stopwatch.Stop();

    return new TimedResult<List<TierFiliale>>(tierFilialen, stopwatch.Elapsed).IntoOkResult();
});

app.MapGet("/tierfilialen/filiale/{id}", (int id, TierDbContext db) =>
{
    stopwatch.Start();
    var tierFilialen = db.TierFilialen.Where(tf => tf.FilialeId == id).ToList();
    stopwatch.Stop();

    return new TimedResult<List<TierFiliale>>(tierFilialen, stopwatch.Elapsed).IntoOkResult();
});

// -----

// POST a new Tier
app.MapPost("/tier", (Tier tier, TierDbContext db) =>
{
    stopwatch.Start();
    db.Tiere.Add(tier);
    db.SaveChanges();
    stopwatch.Stop();

    return new TimedResult<Tier>(tier, stopwatch.Elapsed).IntoCreatedResult();
});

app.MapPut("/tier", (Tier tier, TierDbContext db) =>
{
    stopwatch.Start();
    var foundTier = db.Tiere.Find(tier.Name);
    if (foundTier is null) {
        stopwatch.Stop();
        return Results.NotFound();
    }

    foundTier.Gewicht = tier.Gewicht;
    foundTier.Groesse = tier.Groesse;
    db.SaveChanges();
    stopwatch.Stop();

    return new TimedResult<Tier>(tier, stopwatch.Elapsed).IntoOkResult();
});

app.MapDelete("/tier/{name}", (string name, TierDbContext db) =>
{
    stopwatch.Start();
    var foundTier = db.Tiere.Find(name);
    if (foundTier is null) {
        stopwatch.Stop();
        return Results.NotFound();
    }

    db.Tiere.Remove(foundTier);
    db.SaveChanges();
    stopwatch.Stop();

    return Results.Ok(stopwatch.Elapsed);
});

// POST a new Filiale
app.MapPost("/filiale", (Filiale filiale, TierDbContext db) =>
{
    stopwatch.Start();
    db.Filialen.Add(filiale);
    db.SaveChanges();
    stopwatch.Stop();

    return new TimedResult<Filiale>(filiale, stopwatch.Elapsed).IntoCreatedResult();
});

app.MapPut("/filiale", (Filiale filiale, TierDbContext db) =>
{
    stopwatch.Start();
    var foundFiliale = db.Filialen.Find(filiale.Id);
    if (foundFiliale is null) {
        stopwatch.Stop();
        return Results.NotFound();
    }

    foundFiliale.Adresse = filiale.Adresse;
    foundFiliale.Name = filiale.Name;
    db.SaveChanges();
    stopwatch.Stop();

    return new TimedResult<Filiale>(foundFiliale, stopwatch.Elapsed).IntoOkResult();
});

app.MapDelete("/filiale/{id}", (int id, TierDbContext db) =>
{
    stopwatch.Start();
    var foundFiliale = db.Filialen.Find(id);
    if (foundFiliale is null) {
        stopwatch.Stop();
        return Results.NotFound();
    }

    db.Filialen.Remove(foundFiliale);
    db.SaveChanges();
    stopwatch.Stop();

    return Results.Ok(stopwatch.Elapsed);
});

// POST a new TierFiliale
app.MapPost("/tierfiliale", (TierFiliale tierFiliale, TierDbContext db) =>
{
    stopwatch.Start();
    db.TierFilialen.Add(tierFiliale);
    db.SaveChanges();
    stopwatch.Stop();

    return new TimedResult<TierFiliale>(tierFiliale, stopwatch.Elapsed).IntoCreatedResult();
});

app.MapPut("/tierfiliale", (TierFiliale tierFiliale, TierDbContext db) =>
{
    stopwatch.Start();
    var foundTierFiliale = db.TierFilialen.Find(tierFiliale.FilialeId, tierFiliale.TierName);
    if (foundTierFiliale is null) {
        stopwatch.Stop();
        return Results.NotFound();
    }

    foundTierFiliale.Anzahl = tierFiliale.Anzahl;
    db.SaveChanges();
    stopwatch.Stop();

    return new TimedResult<TierFiliale>(foundTierFiliale, stopwatch.Elapsed).IntoOkResult();
});

app.MapDelete("/tierfiliale/{id}/{name}", (int id, string name, TierDbContext db) =>
{
    stopwatch.Start();
    var foundTierFiliale = db.TierFilialen.Find(id, name);
    if (foundTierFiliale is null) {
        stopwatch.Stop();
        return Results.NotFound();
    }

    db.TierFilialen.Remove(foundTierFiliale);
    db.SaveChanges();
    stopwatch.Stop();

    return Results.Ok(stopwatch.Elapsed);
});

// Seeding
app.MapPost("/startseed", (SeedingRequest seedingRequest, SeedingService seedingService, TierDbContext db) =>
{
    seedingService.Seed(
        db,
        seedingRequest.TierCount,
        seedingRequest.FilialeCount,
        seedingRequest.TierFilialeCount,
        seedingRequest.TierFilialeAnzahl
    );

    return Results.Ok(seedingService.stopwatch.Elapsed);
});

// Mongo Begin

// GET Tiere
app.MapGet("mongo/tiere", (MongoTierDbContext db) => {
    stopwatch.Start();
    var filialen = db.Filialen;
    var tiere = new List<MongoTier>();

    foreach (var f in filialen) {
        tiere.AddRange(f.Tiere);
    }
    stopwatch.Stop();

    return new TimedResult<List<MongoTier>>(tiere, stopwatch.Elapsed).IntoOkResult();
});

app.MapGet("mongo/tier/{name}", (string name, MongoTierDbContext db) => {
    stopwatch.Start();
    var filialen = db.Filialen;
    var tiere = new List<MongoTier>();

    foreach (var f in filialen) {
        tiere.AddRange(f.Tiere.Where(t => t.Name == name));
    }
    stopwatch.Stop();
    return new TimedResult<List<MongoTier>>(tiere, stopwatch.Elapsed).IntoOkResult();
});

app.MapGet("mongo/tiere/filiale/{id}", (int id, MongoTierDbContext db) => {
    stopwatch.Start();
    var filiale = db.Filialen.Find(id);
    if (filiale is null) {
        stopwatch.Stop();
        return Results.NotFound();
    }
    var tiere = filiale.Tiere.ToList();

    return new TimedResult<List<MongoTier>>(tiere, stopwatch.Elapsed).IntoOkResult();
});

// GET Filialen
app.MapGet("mongo/filialen", (MongoTierDbContext db) => {
    stopwatch.Start();
    var filialen = db.Filialen.ToList();
    stopwatch.Stop();

    return new TimedResult<List<MongoFiliale>>(filialen, stopwatch.Elapsed).IntoOkResult(); ;
});

app.MapGet("mongo/filiale/{id}", (int id, MongoTierDbContext db) => {
    stopwatch.Start();
    var filiale = db.Filialen.Find(id);
    stopwatch.Stop();
    if (filiale is null) {
        return Results.NotFound();
    }


    return new TimedResult<MongoFiliale>(filiale, stopwatch.Elapsed).IntoOkResult();
});

app.MapGet("mongo/filialen/tier/{name}", (string name, MongoTierDbContext db) => {
    stopwatch.Start();
    var filialen = db.Filialen.Where(f => f.Tiere.FirstOrDefault(t => t.Name == name) == null).ToList();
    stopwatch.Stop();

    return new TimedResult<List<MongoFiliale>>(filialen, stopwatch.Elapsed).IntoOkResult();
});

// -----

// POST a new Tier
app.MapPost("mongo/tier/{id}", (MongoTier tier, int id, MongoTierDbContext db) => {
    stopwatch.Start();
    var foundFiliale = db.Filialen.Find(id);
    if (foundFiliale is null) {
        stopwatch.Stop();
        return Results.NotFound();
    }

    foundFiliale.Tiere.Add(tier);
    db.SaveChanges();
    stopwatch.Stop();

    return new TimedResult<MongoFiliale>(foundFiliale, stopwatch.Elapsed).IntoCreatedResult();
});

app.MapPut("mongo/tier", (MongoTier tier, MongoTierDbContext db) => {
    stopwatch.Start();
    foreach(var f in db.Filialen) {
        foreach (var t in f.Tiere.Where(t => t.Name == tier.Name)) {
            t.Anzahl = tier.Anzahl;
            t.Groesse = tier.Groesse;
            t.Gewicht = tier.Gewicht;
        }
    }
    db.SaveChanges();
    stopwatch.Stop();

    return new TimedResult<MongoTier>(tier, stopwatch.Elapsed);
});

app.MapDelete("mongo/tier/{name}", (string name, MongoTierDbContext db) => {
    stopwatch.Start();
    foreach (var f in db.Filialen) {
        foreach (var t in f.Tiere.Where(t => t.Name == name)) {
            f.Tiere.Remove(t);
        }
    }
    db.SaveChanges();
    stopwatch.Stop();

    return Results.Ok(stopwatch.Elapsed);
});

// POST a new Filiale
app.MapPost("mongo/filiale", (MongoFiliale filiale, MongoTierDbContext db) => {
    stopwatch.Start();
    db.Filialen.Add(filiale);
    db.SaveChanges();
    stopwatch.Stop();

    return new TimedResult<MongoFiliale>(filiale, stopwatch.Elapsed).IntoCreatedResult();
});

app.MapPut("mongo/filiale", (MongoFiliale filiale, MongoTierDbContext db) => {
    stopwatch.Start();
    var foundFiliale = db.Filialen.Find(filiale.Id);
    if (foundFiliale is null) {
        stopwatch.Stop();
        return Results.NotFound(); 
    }

    foundFiliale.Adresse = filiale.Adresse;
    foundFiliale.Name = filiale.Name;
    db.SaveChanges();
    stopwatch.Stop();

    return new TimedResult<MongoFiliale>(foundFiliale, stopwatch.Elapsed).IntoOkResult();
});

app.MapDelete("mongo/filiale/{id}", (int id, MongoTierDbContext db) => {
    stopwatch.Start();
    var foundFiliale = db.Filialen.Find(id);
    if (foundFiliale is null) {
        stopwatch.Stop();
        return Results.NotFound(); 
    }

    db.Filialen.Remove(foundFiliale);
    db.SaveChanges();
    stopwatch.Stop();

    return Results.Ok(stopwatch.Elapsed);
});

// Seeding
app.MapPost("mongo/startseed", (SeedingRequest seedingRequest, SeedingService seedingService, MongoTierDbContext db) => {
    seedingService.SeedMongo(
        db,
        seedingRequest.TierCount,
        seedingRequest.FilialeCount,
        seedingRequest.TierFilialeAnzahl
    );

    return Results.Ok(seedingService.stopwatch.Elapsed);
});

app.Run();


[JsonSerializable(typeof(Tier))]
[JsonSerializable(typeof(List<Tier>))]
[JsonSerializable(typeof(Filiale))]
[JsonSerializable(typeof(List<Filiale>))]
[JsonSerializable(typeof(TierFiliale))]
[JsonSerializable(typeof(List<TierFiliale>))]
[JsonSerializable(typeof(SeedingRequest))]
internal partial class AppJsonSerializerContext : JsonSerializerContext {}