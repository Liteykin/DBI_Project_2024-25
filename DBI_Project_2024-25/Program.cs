using System.Text.Json.Serialization;
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

// GET Tiere
app.MapGet("/tiere", async (TierDbContext db) =>
    Results.Ok(await db.Tiere.ToListAsync()));

app.MapGet("/tier/{name}", async (string name, TierDbContext db) =>
{
    var tier = await db.Tiere.FindAsync(name);
    return tier is null ? Results.NotFound() : Results.Ok(tier);
});

app.MapGet("/tiere/filiale/{id}", (int id, TierDbContext db) =>
{
    var tiere = db.TierFilialen
        .Where(tf => tf.FilialeId == id)
        .Join(db.Tiere, tf => tf.TierName, t => t.Name, (tf, t) => t);

    return Results.Ok(tiere.ToList());
});

// GET Filialen
app.MapGet("/filialen", async (TierDbContext db) =>
    Results.Ok(await db.Filialen.ToListAsync()));

app.MapGet("/filiale/{id}", async (int id, TierDbContext db) =>
{
    var filiale = await db.Filialen.FindAsync(id);
    return filiale is null ? Results.NotFound() : Results.Ok(filiale);
});

app.MapGet("/filialen/tier/{name}", (string name, TierDbContext db) =>
{
    var filialen = db.TierFilialen
        .Where(tf => tf.TierName == name)
        .Join(db.Filialen, tf => tf.FilialeId, f => f.Id, (tf, f) => f);

    return Results.Ok(filialen.ToList());
});

// GET all TierFilialen
app.MapGet("/tierfilialen", async (TierDbContext db) =>
    Results.Ok(await db.TierFilialen.ToListAsync()));

app.MapGet("/tierfilialen/tier/{name}", (string name, TierDbContext db) =>
{
    var tierFilialen = db.TierFilialen.Where(tf => tf.TierName == name);

    return Results.Ok(tierFilialen.ToList());
});

app.MapGet("/tierfilialen/filiale/{id}", (int id, TierDbContext db) =>
{
    var tierFilialen = db.TierFilialen.Where(tf => tf.FilialeId == id);

    return Results.Ok(tierFilialen.ToList());
});

// -----

// POST a new Tier
app.MapPost("/tier", (Tier tier, TierDbContext db) =>
{
    db.Tiere.Add(tier);
    db.SaveChanges();
    return Results.Created($"/tiere/{tier.Name}", tier);
});

app.MapPut("/tier", (Tier tier, TierDbContext db) =>
{
    var foundTier = db.Tiere.Find(tier.Name);
    if (foundTier is null) return Results.NotFound();

    foundTier.Gewicht = tier.Gewicht;
    foundTier.Groesse = tier.Groesse;
    db.SaveChanges();

    return Results.Ok(tier);
});

app.MapDelete("/tier/{name}", (string name, TierDbContext db) =>
{
    var foundTier = db.Tiere.Find(name);
    if (foundTier is null) return Results.NotFound();

    db.Tiere.Remove(foundTier);
    db.SaveChanges();

    return Results.Ok();
});

// POST a new Filiale
app.MapPost("/filiale", (Filiale filiale, TierDbContext db) =>
{
    db.Filialen.Add(filiale);
    db.SaveChanges();

    return Results.Created($"/filialen/{filiale.Id}", filiale);
});

app.MapPut("/filiale", (Filiale filiale, TierDbContext db) =>
{
    var foundFiliale = db.Filialen.Find(filiale.Id);
    if (foundFiliale is null) return Results.NotFound();

    foundFiliale.Adresse = filiale.Adresse;
    foundFiliale.Name = filiale.Name;
    db.SaveChanges();

    return Results.Ok(filiale);
});

app.MapDelete("/filiale/{id}", (int id, TierDbContext db) =>
{
    var foundFiliale = db.Filialen.Find(id);
    if (foundFiliale is null) return Results.NotFound();

    db.Filialen.Remove(foundFiliale);
    db.SaveChanges();

    return Results.Ok();
});

// POST a new TierFiliale
app.MapPost("/tierfiliale", (TierFiliale tierFiliale, TierDbContext db) =>
{
    db.TierFilialen.Add(tierFiliale);
    db.SaveChanges();
    return Results.Created();
});

app.MapPut("/tierfiliale", (TierFiliale tierFiliale, TierDbContext db) =>
{
    var foundTierFiliale = db.TierFilialen.Find(tierFiliale.FilialeId, tierFiliale.TierName);
    if (foundTierFiliale is null) return Results.NotFound();

    foundTierFiliale.Anzahl = tierFiliale.Anzahl;
    db.SaveChanges();

    return Results.Ok(tierFiliale);
});

app.MapDelete("/tierfiliale/{id}/{name}", (int id, string name, TierDbContext db) =>
{
    var foundTierFiliale = db.TierFilialen.Find(id, name);
    if (foundTierFiliale is null) return Results.NotFound();

    db.TierFilialen.Remove(foundTierFiliale);
    db.SaveChanges();

    return Results.Ok();
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
    var filialen = db.Filialen;
    var tiere = new List<MongoTier>();

    foreach (var f in filialen) {
        tiere.AddRange(f.Tiere);
    }

    return Results.Ok(tiere);
});

app.MapGet("mongo/tier/{name}", (string name, MongoTierDbContext db) => {
    var filialen = db.Filialen;
    var tiere = new List<MongoTier>();

    foreach (var f in filialen) {
        tiere.AddRange(f.Tiere.Where(t => t.Name == name));
    }
    return Results.Ok(tiere);
});

app.MapGet("mongo/tiere/filiale/{id}", (int id, MongoTierDbContext db) => {
    var tiere = db.Filialen.Find(id)?.Tiere ?? [];

    return Results.Ok(tiere.ToList());
});

// GET Filialen
app.MapGet("mongo/filialen", async (MongoTierDbContext db) =>
    Results.Ok(await db.Filialen.ToListAsync()));

app.MapGet("mongo/filiale/{id}", async (int id, MongoTierDbContext db) => {
    var filiale = await db.Filialen.FindAsync(id);
    return filiale is null ? Results.NotFound() : Results.Ok(filiale);
});

app.MapGet("mongo/filialen/tier/{name}", (string name, MongoTierDbContext db) => {
    var filialen = db.Filialen.Where(f => f.Tiere.FirstOrDefault(t => t.Name == name) == null);

    return Results.Ok(filialen.ToList());
});

// -----

// POST a new Tier
app.MapPost("mongo/tier/{id}", (MongoTier tier, int id, MongoTierDbContext db) => {
    var filiale = db.Filialen.Find(id);
    if (filiale is null) {
        return Results.NotFound();
    }

    filiale.Tiere.Add(tier);
    db.SaveChanges();

    return Results.Created($"mongo/tiere/{tier.Name}", tier);
});

app.MapPut("mongo/tier", (MongoTier tier, MongoTierDbContext db) => {
    var foundTiere = db.Filialen.SelectMany(f => f.Tiere.Where(t => t.Name == tier.Name));
    foreach(var t in foundTiere) {
        t.Anzahl = tier.Anzahl;
        t.Groesse = tier.Groesse;
        t.Gewicht = tier.Gewicht;
    }
    db.SaveChanges();

    return Results.Ok(foundTiere.ToList());
});

app.MapDelete("mongo/tier/{name}", (string name, MongoTierDbContext db) => {

    foreach (var f in db.Filialen) {
        foreach (var t in f.Tiere.Where(t => t.Name == name)) {
            f.Tiere.Remove(t);
        }
    }

    db.SaveChanges();

    return Results.Ok();
});

// POST a new Filiale
app.MapPost("mongo/filiale", (MongoFiliale filiale, MongoTierDbContext db) => {
    db.Filialen.Add(filiale);
    db.SaveChanges();

    return Results.Created($"mongo/filialen/{filiale.Id}", filiale);
});

app.MapPut("mongo/filiale", (MongoFiliale filiale, MongoTierDbContext db) => {
    var foundFiliale = db.Filialen.Find(filiale.Id);
    if (foundFiliale is null) return Results.NotFound();

    foundFiliale.Adresse = filiale.Adresse;
    foundFiliale.Name = filiale.Name;
    db.SaveChanges();

    return Results.Ok(filiale);
});

app.MapDelete("mongo/filiale/{id}", (int id, MongoTierDbContext db) => {
    var foundFiliale = db.Filialen.Find(id);
    if (foundFiliale is null) return Results.NotFound();

    db.Filialen.Remove(foundFiliale);
    db.SaveChanges();

    return Results.Ok();
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