using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using DBI_Project_2024_25.Models;
using Microsoft.AspNetCore.Routing.Constraints;
using DBI_Project_2024_25.Infrastructure;

var builder = WebApplication.CreateSlimBuilder(args);

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

builder.Services.AddDbContext<TierDbContext>(options => {
    if (builder.Environment.IsDevelopment()) {
        options.EnableSensitiveDataLogging();
    }
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection"));
});

var app = builder.Build();

using (var scope = app.Services.CreateScope()) {
    var db = scope.ServiceProvider.GetRequiredService<TierDbContext>();
    db.Database.EnsureDeleted();
    db.Database.EnsureCreated();
}

if (app.Environment.IsDevelopment()) {
    app.UseSwagger();
    app.UseSwaggerUI();
}

;

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

app.MapPost("/startseed", (SeedingRequest seedingRequest, SeedingService seedingService, TierDbContext db) => {
    seedingService.Seed(db, seedingRequest.TierCount, seedingRequest.FilialeCount, seedingRequest.TierFilialeCount, seedingRequest.TierFilialeAnzahl);
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