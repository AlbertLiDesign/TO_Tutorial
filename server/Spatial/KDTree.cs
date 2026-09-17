// SPDX-License-Identifier: MIT
// Original implementation for BESO Lab. No code from the former KDTree.dll is used.
namespace KDTree;

/// <summary>
/// Exact Euclidean k-nearest/radius queries. The radius argument is SQUARED,
/// matching the BESO filter call contract. Equal distances use insertion order.
/// Concurrent queries share an immutable index; each query owns its search heap.
/// </summary>
public sealed class KDTree<T>
{
    private sealed record Point(double[] Coordinates, T Value, int Order);
    private sealed class Branch
    {
        public Point[] Leaf;
        public int Axis;
        public double Split;
        public Branch Left, Right;
    }
    private readonly int dimensions, bucketCapacity;
    private readonly List<Point> points = new();
    private readonly object gate = new();
    private Branch root;
    private bool dirty = true;

    public KDTree(int dimensions) : this(dimensions, 16) { }
    public KDTree(int dimensions, int bucketCapacity)
    {
        if (dimensions < 1) throw new ArgumentOutOfRangeException(nameof(dimensions));
        if (bucketCapacity < 1) throw new ArgumentOutOfRangeException(nameof(bucketCapacity));
        this.dimensions = dimensions;
        this.bucketCapacity = bucketCapacity;
    }

    public void AddPoint(double[] coordinates, T value)
    {
        Validate(coordinates);
        lock (gate)
        {
            points.Add(new Point((double[])coordinates.Clone(), value, points.Count));
            dirty = true;
        }
    }

    public IEnumerable<T> NearestNeighbors(double[] searchPoint, int maxReturned, double squaredRadius = -1)
    {
        Validate(searchPoint);
        if (maxReturned < 0) throw new ArgumentOutOfRangeException(nameof(maxReturned));
        if (double.IsNaN(squaredRadius)) throw new ArgumentOutOfRangeException(nameof(squaredRadius));
        if (maxReturned == 0) return Array.Empty<T>();
        var query = (double[])searchPoint.Clone();
        Branch snapshot;
        lock (gate)
        {
            if (dirty) { root = Build(points.ToArray(), 0, points.Count); dirty = false; }
            snapshot = root;
        }
        double limit = squaredRadius < 0 ? double.PositiveInfinity : squaredRadius;
        // Negated keys make the maximum distance (then latest insertion) pop first.
        var candidates = new PriorityQueue<Point, (double Distance, int Order)>();
        double Distance(Point point)
        {
            double sum = 0;
            for (int d = 0; d < dimensions; d++) { double v = query[d] - point.Coordinates[d]; sum += v * v; }
            return sum;
        }
        double Cutoff()
        {
            if (candidates.Count < maxReturned) return limit;
            candidates.TryPeek(out _, out var priority);
            return Math.Min(limit, -priority.Distance);
        }
        void Visit(Branch node)
        {
            if (node == null) return;
            if (node.Leaf != null)
            {
                foreach (var point in node.Leaf)
                {
                    double distance = Distance(point);
                    if (distance > limit) continue;
                    if (candidates.Count < maxReturned) candidates.Enqueue(point, (-distance, -point.Order));
                    else
                    {
                        candidates.TryPeek(out _, out var worst);
                        if (distance < -worst.Distance || (distance == -worst.Distance && point.Order < -worst.Order))
                        { candidates.Dequeue(); candidates.Enqueue(point, (-distance, -point.Order)); }
                    }
                }
                return;
            }
            double delta = query[node.Axis] - node.Split;
            Visit(delta <= 0 ? node.Left : node.Right);
            // Equality must be searched: the other branch may contain an earlier tied point.
            if (delta * delta <= Cutoff()) Visit(delta <= 0 ? node.Right : node.Left);
        }
        Visit(snapshot);
        return candidates.UnorderedItems.OrderBy(item => -item.Priority.Distance)
            .ThenBy(item => item.Element.Order).Select(item => item.Element.Value).ToArray();
    }

    private Branch Build(Point[] data, int start, int length)
    {
        if (length == 0) return null;
        if (length <= bucketCapacity) return new Branch { Leaf = data[start..(start + length)] };
        int axis = 0; double widest = -1;
        for (int d = 0; d < dimensions; d++)
        {
            double low = double.PositiveInfinity, high = double.NegativeInfinity;
            for (int i = start; i < start + length; i++) { low = Math.Min(low, data[i].Coordinates[d]); high = Math.Max(high, data[i].Coordinates[d]); }
            if (high - low > widest) { widest = high - low; axis = d; }
        }
        Array.Sort(data, start, length, Comparer<Point>.Create((a,b) =>
        {
            int comparison = a.Coordinates[axis].CompareTo(b.Coordinates[axis]);
            return comparison != 0 ? comparison : a.Order.CompareTo(b.Order);
        }));
        int half = length / 2;
        return new Branch { Axis = axis, Split = data[start + half].Coordinates[axis],
            Left = Build(data, start, half), Right = Build(data, start + half, length - half) };
    }
    private void Validate(double[] coordinates)
    {
        if (coordinates == null || coordinates.Length != dimensions || coordinates.Any(v => !double.IsFinite(v)))
            throw new ArgumentException("Coordinates must be finite and match the tree dimension.", nameof(coordinates));
    }
}
