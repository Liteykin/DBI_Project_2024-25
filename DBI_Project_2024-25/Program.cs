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

// GET all Tiere
app.MapGet("/tiere", async (TierDbContext db) =>
    await db.Tiere.ToListAsync());

// GET all Filialen
app.MapGet("/filialen", async (TierDbContext db) =>
    await db.Filialen.ToListAsync());

// GET all TierFilialen
app.MapGet("/tierfilialen", async (TierDbContext db) =>
    await db.TierFilialen.ToListAsync());

// POST a new Tier
app.MapPost("/tiere", async (Tier tier, TierDbContext db) =>
{
    db.Tiere.Add(tier);
    await db.SaveChangesAsync();
    return Results.Created($"/tiere/{tier.Name}", tier);
});

// POST a new Filiale
app.MapPost("/filialen", async (Filiale filiale, TierDbContext db) =>
{
    db.Filialen.Add(filiale);
    await db.SaveChangesAsync();
    return Results.Created($"/filialen/{filiale.Id}", filiale);
});

// POST a new TierFiliale
app.MapPost("/tierfilialen", async (TierFiliale tierFiliale, TierDbContext db) =>
{
    db.TierFilialen.Add(tierFiliale);
    await db.SaveChangesAsync();
    return Results.Created($"/tierfilialen/{tierFiliale.FilialeId}/{tierFiliale.TierName}", tierFiliale);
});

app.Run();

[JsonSerializable(typeof(Tier))]
[JsonSerializable(typeof(List<Tier>))]
[JsonSerializable(typeof(Filiale))]
[JsonSerializable(typeof(List<Filiale>))]
[JsonSerializable(typeof(TierFiliale))]
[JsonSerializable(typeof(List<TierFiliale>))]
internal partial class AppJsonSerializerContext : JsonSerializerContext
{
}