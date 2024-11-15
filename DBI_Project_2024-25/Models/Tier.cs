using System.ComponentModel.DataAnnotations;

namespace DBI_Project_2024_25.Models;

public class Tier
{
    [Key]
    public string Name { get; set; } = default!;
    public decimal Groesse { get; set; } = -1;
    public decimal Gewicht { get; set; } = -1;

    public ICollection<TierFiliale> TierFilialen { get; set; } = new List<TierFiliale>();

    public Tier() { }

    public Tier(string name, int groesse, decimal gewicht)
    {
        Name = name;
        Groesse = groesse;
        Gewicht = gewicht;
    }
}