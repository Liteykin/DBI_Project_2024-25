using System.ComponentModel.DataAnnotations;

namespace DBI_Project_2024_25.Models;

public class Tier
{
    [Key]
    public int Id { get; set; }
    public string Name { get; set; } = default!;
    public int Groesse { get; set; }
    public decimal Gewicht { get; set; }

    public ICollection<TierFiliale> TierFilialen { get; set; } = new List<TierFiliale>();

    public Tier(string name, int groesse, decimal gewicht)
    {
        Name = name;
        Groesse = groesse;
        Gewicht = gewicht;
    }
}