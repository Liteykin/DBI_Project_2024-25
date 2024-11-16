using MongoDB.Bson.Serialization.Attributes;

namespace DBI_Project_2024_25.Models.MongoModels;

public class MongoTierFiliale
{
    public MongoTierFiliale()
    {
    }

    public MongoTierFiliale(int filialeId, string tierName, int anzahl)
    {
        FilialeId = filialeId;
        TierName = tierName;
        Anzahl = anzahl;
    }

    [BsonElement("filialeId")] public int FilialeId { get; set; } = -1;
    [BsonElement("tierName")] public string TierName { get; set; } = default!;
    [BsonElement("anzahl")] public int Anzahl { get; set; } = -1;
}