using MongoDB.Bson.Serialization.Attributes;

namespace DBI_Project_2024_25.Models.MongoModels;

public class MongoTier
{
    public MongoTier()
    {
    }

    public MongoTier(string name, decimal groesse, decimal gewicht)
    {
        Name = name;
        Groesse = groesse;
        Gewicht = gewicht;
    }

    [BsonId] [BsonElement("name")] public string Name { get; set; } = default!;
    [BsonElement("groesse")] public decimal Groesse { get; set; } = -1;
    [BsonElement("gewicht")] public decimal Gewicht { get; set; } = -1;
    [BsonElement("tierFilialen")] public ICollection<MongoTierFiliale> TierFilialen { get; set; } = new List<MongoTierFiliale>();
}