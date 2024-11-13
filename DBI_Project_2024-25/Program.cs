using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using DBI_Project_2024_25.Models;
using Npgsql;

var builder = WebApplication.CreateSlimBuilder(args);

builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.TypeInfoResolverChain.Insert(0, AppJsonSerializerContext.Default);
});

// Setup NpgsqlDataSource
var dataSourceBuilder = new NpgsqlDataSourceBuilder(builder.Configuration.GetConnectionString("DefaultConnection"));
var dataSource = dataSourceBuilder.Build();

builder.Services.AddDbContext<TierDbContext>(options =>
    options.UseNpgsql(dataSource));

var app = builder.Build();

// GET Tiere
app.MapGet("/tiere", async (TierDbContext db) =>
    await db.Tiere.ToListAsync());

app.MapGet("/tiere/{name}", async (string name, TierDbContext db) => {
    var tier = await db.Tiere.FindAsync(name);
    return (tier is null) ? Results.NotFound() : Results.Ok(tier);
});

// GET Filialen
app.MapGet("/filialen", async (TierDbContext db) =>
    await db.Filialen.ToListAsync());

app.MapGet("/filialen/{id}", async (int id, TierDbContext db) => {
    var filiale = await db.Filialen.FindAsync(id);
    return (filiale is null) ? Results.NotFound() : Results.Ok(filiale);
});

// GET all TierFilialen
app.MapGet("/tierfilialen", async (TierDbContext db) =>
    await db.TierFilialen.ToListAsync());

// POST a new Tier
app.MapPost("/tiere", (Tier tier, TierDbContext db) =>
{
    db.Tiere.Add(tier);
    db.SaveChanges();
    return Results.Created($"/tiere/{tier.Name}", tier);
});

// POST a new Filiale
app.MapPost("/filialen", (Filiale filiale, TierDbContext db) =>
{
    db.Filialen.Add(filiale);
    db.SaveChanges();
    return Results.Created($"/filialen/{filiale.Id}", filiale);
});

// POST a new TierFiliale
app.MapPost("/tierfilialen", (TierFiliale tierFiliale, TierDbContext db) =>
{
    db.TierFilialen.Add(tierFiliale);
    db.SaveChanges();
    return Results.Created();
});

app.Run();

[JsonSerializable(typeof(Tier))]
[JsonSerializable(typeof(List<Tier>))]
[JsonSerializable(typeof(Filiale))]
[JsonSerializable(typeof(List<Filiale>))]
[JsonSerializable(typeof(TierFiliale))]
[JsonSerializable(typeof(List<TierFiliale>))]
internal partial class AppJsonSerializerContext : JsonSerializerContext {}