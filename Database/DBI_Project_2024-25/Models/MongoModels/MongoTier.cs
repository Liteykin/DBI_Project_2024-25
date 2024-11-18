using Newtonsoft.Json;
using MongoDB.Bson.Serialization.Attributes;

public class MongoTier
{
    public MongoTier() { }

    public MongoTier(string name, decimal groesse, decimal gewicht)
    {
        Name = name;
        Groesse = groesse;
        Gewicht = gewicht;
    }

    [BsonElement("name")]
    [JsonProperty("name")]
    public string Name { get; set; } = default!;

    [BsonElement("groesse")]
    [JsonProperty("groesse")]
    public decimal Groesse { get; set; } = -1;

    [BsonElement("gewicht")]
    [JsonProperty("gewicht")]
    public decimal Gewicht { get; set; } = -1;

    [BsonElement("anzahl")]
    [JsonProperty("anzahl")]
    public int Anzahl { get; set; } = -1;
}